
import { GoogleGenAI } from "@google/genai";
import { Project, File } from '../types';

let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

export const isApiKeySet = (): boolean => !!apiKey;

const getPromptText = (prompt: string, existingProject: Project | null, withImage: boolean, projectName?: string): string => {
    const fileStructureInterface = `
interface ProjectFile {
  path: string; // e.g., "src/components/Button.tsx" or "index.html"
  content: string; // The full code content for the file. Use TailwindCSS for styling via CDN.
}`;

    if (existingProject) {
        let text = `You are an expert web development agent. Your task is to modify an existing web application based on a user's request.
You MUST respond with ONLY a valid JSON object representing the *complete and updated* file structure. Do not include any explanatory text, markdown formatting (like \`\`\`json\`), or any other characters outside of the JSON object.

The JSON object must be an array of objects, conforming to this TypeScript interface:
${fileStructureInterface}

Here is the current project's file structure and content:
${JSON.stringify(existingProject.files, null, 2)}
`;
        if (withImage) {
            text += `\nThe user has also provided an image as a design reference. You MUST base your modifications on the provided image and the text request. The text request provides additional context or specifies details.\n`;
        }
        text += `\nThe user's modification request is: "${prompt}"\n\nBased on this request (and the image if provided), generate the full, updated array of all project files. You can add, remove, or modify files as needed. Ensure all file contents are complete and functional, and that paths in \`href\` and \`src\` attributes are correct relative paths to other files in the project.`;
        return text;
    } else {
        let text = `You are an expert web development agent. Your task is to generate the file structure and content for a new web application based on a user's prompt.
You MUST respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting (like \`\`\`json\`), or any other characters outside of the JSON object.

The JSON object must be an array of objects, conforming to this TypeScript interface:
${fileStructureInterface}

The user has named the project: "${projectName || 'Untitled'}". Create a project that matches this name and the following description.
`;
        if (withImage) {
            text += `\nThe user has also provided an image as a design reference. You MUST base your design on this image.\n`;
        }
        text += `\nThe user's request is: "${prompt}"\n\nBased on this request (and the image if provided), generate an array of ProjectFile objects. For a simple request, you might only generate an 'index.html'. For a complex React app, you should generate 'package.json', 'tailwind.config.js', 'index.html', 'src/index.tsx', 'src/App.tsx', and any other necessary components. Always include a README.md file explaining the project and how to run it. Ensure all generated code is complete and functional, and that paths in \`href\` and \`src\` attributes are correct relative paths to other files in the project (e.g., './style.css').`;
        return text;
    }
}

export const generateProjectFromPrompt = async (prompt: string, existingProject: Project | null, imageBase64: string | null, imageType: string | null, projectName?: string): Promise<Project> => {
    if (!ai) {
      throw new Error("AI Service is not available. Please configure the API Key.");
    }
    try {
        const model = 'gemini-2.5-flash-preview-04-17';
        
        const textPart = getPromptText(prompt, existingProject, !!imageBase64, projectName);
        
        const contents = (imageBase64 && imageType) 
            ? { parts: [{ text: textPart }, { inlineData: { mimeType: imageType, data: imageBase64 } }] }
            : textPart;

        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                responseMimeType: "application/json",
                temperature: 0.1,
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const filesData: { path: string, content: string }[] = JSON.parse(jsonStr);

        if (!Array.isArray(filesData) || filesData.length === 0) {
            throw new Error('AI returned an invalid or empty file structure.');
        }

        const newFiles: File[] = filesData.map((fileData, index) => ({
            id: `file-${Date.now()}-${index}`,
            path: fileData.path,
            content: fileData.content,
        }));

        const newProject: Project = {
            id: existingProject?.id || `proj-${Date.now()}`,
            name: existingProject?.name || projectName || prompt.substring(0, 30).trim(),
            files: newFiles,
        };

        return newProject;
    } catch (error) {
        console.error("Error generating project from Gemini:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse AI response. The AI may have returned an invalid JSON format.");
        }
        throw new Error("Failed to generate project. Please try again.");
    }
};