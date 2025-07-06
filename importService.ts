
import { Project, File } from './types';

const parseGitHubUrl = (url: string): { user: string; repo: string } | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'github.com') return null;
        const pathParts = urlObj.pathname.replace(/\.git$/, '').split('/').filter(p => p);
        if (pathParts.length < 2) return null;
        return { user: pathParts[0], repo: pathParts[1] };
    } catch (e) {
        return null;
    }
}

export const importFromGitHub = async (repoUrl: string): Promise<Project> => {
    const repoInfo = parseGitHubUrl(repoUrl);
    if (!repoInfo) {
        throw new Error('Invalid GitHub repository URL. Please use a format like https://github.com/user/repo.');
    }

    const { user, repo } = repoInfo;

    // Fetch file list
    const fileListUrl = `https://data.jsdelivr.com/v1/package/gh/${user}/${repo}@latest/flat`;
    const fileListResponse = await fetch(fileListUrl);
    if (!fileListResponse.ok) {
        throw new Error(`Could not fetch file list for ${user}/${repo}. The repository might be private or not exist.`);
    }
    const fileListJson = await fileListResponse.json();
    const repoFiles: { name: string }[] = fileListJson.files;

    // Fetch content for each file
    const filePromises = repoFiles.map(async (fileInfo) => {
        const filePath = fileInfo.name.startsWith('/') ? fileInfo.name.substring(1) : fileInfo.name;
        const fileContentUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@latest/${filePath}`;
        try {
            const contentResponse = await fetch(fileContentUrl);
            if (!contentResponse.ok) return null; // Skip files that can't be fetched
            const content = await contentResponse.text();
            return {
                id: `file-${Date.now()}-${Math.random()}`,
                path: filePath,
                content: content,
            };
        } catch (e) {
            return null; // Skip on network error
        }
    });

    const resolvedFiles = (await Promise.all(filePromises)).filter((f): f is File => f !== null);

    if (resolvedFiles.length === 0) {
        throw new Error("No files could be imported from the repository. It might be empty or contain unsupported file types.");
    }

    const importedProject: Project = {
        id: `proj-${Date.now()}`,
        name: repo,
        githubUrl: repoUrl,
        files: resolvedFiles,
    };

    return importedProject;
};