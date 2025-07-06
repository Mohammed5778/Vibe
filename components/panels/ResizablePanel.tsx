import React, { useRef, useCallback, ReactNode } from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';

interface CollapseProps {
  onCollapse: () => void;
  isCollapsed: boolean;
  direction?: 'left' | 'right';
}

interface ResizablePanelProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  size: number;
  onResize: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  leftPanelCollapse?: CollapseProps;
  rightPanelCollapse?: CollapseProps;
}

const CollapseButton = ({ onCollapse, direction }: { onCollapse: () => void; direction: 'left' | 'right' }) => {
  const Icon = direction === 'left' ? PanelRight : PanelLeft;
  return (
    <div 
        className="absolute top-1/2 -translate-y-1/2 bg-dark-pane hover:bg-primary/20 text-medium-text hover:text-primary transition-all duration-200 cursor-pointer p-2 rounded-full border border-dark-border shadow-lg"
        style={direction === 'left' ? { left: '10px' } : { right: '10px' }}
        onClick={(e) => { e.stopPropagation(); onCollapse(); }}
    >
        <Icon size={20} />
    </div>
  );
};

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
  size,
  onResize,
  minSize = 10,
  maxSize = 90,
  leftPanelCollapse,
  rightPanelCollapse,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let newSize = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        if (newSize < minSize) newSize = 0;
        if (newSize > maxSize) newSize = 100;
        onResize(newSize);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [minSize, maxSize, onResize]);

  if (leftPanelCollapse?.isCollapsed) {
    return (
        <div className="relative w-full h-full">
            <CollapseButton onCollapse={leftPanelCollapse.onCollapse} direction="left" />
            {rightPanel}
        </div>
    );
  }

  if (rightPanelCollapse?.isCollapsed) {
    return (
        <div className="relative w-full h-full">
            <CollapseButton onCollapse={rightPanelCollapse.onCollapse} direction="right" />
            {leftPanel}
        </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ flexBasis: `${size}%` }} className="h-full min-w-0">
        {leftPanel}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="flex-shrink-0 w-2 cursor-col-resize flex items-center justify-center group"
      >
        <div className="w-0.5 h-full bg-dark-border group-hover:bg-primary transition-colors duration-200"></div>
      </div>
      <div style={{ flexBasis: `${100 - size}%` }} className="h-full min-w-0">
        {rightPanel}
      </div>
    </div>
  );
};