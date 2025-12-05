import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { FileNode } from '../../preload';

interface FileTreeProps {
  node: FileNode;
  onFileClick?: (path: string) => void;
  level?: number;
}

const FileTreeNode: React.FC<FileTreeProps> = ({ node, onFileClick, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick?.(node.path);
    }
  };

  // Render indent guides (vertical lines) for each level
  const renderIndentGuides = () => {
    const guides = [];
    for (let i = 0; i < level; i++) {
      guides.push(
        <div
          key={i}
          className="flex-shrink-0 flex items-center"
          style={{ width: '16px', marginLeft: i === 0 ? '8px' : '0' }}
        >
          <div
            style={{
              width: '1px',
              height: '28px',
              backgroundColor: '#e0e0e0',
              marginLeft: '7px'
            }}
          />
        </div>
      );
    }
    return guides;
  };

  return (
    <div>
      <div
        className="flex items-center gap-4 pr-2 hover:bg-[#e8e8e8] cursor-pointer group"
        style={{
          fontSize: '13.75px',
          color: '#5c5c5c',
          lineHeight: '2',
          paddingLeft: level === 0 ? '8px' : '0',
          marginLeft: node.type === 'file' ? '16px' : '0'
        }}
        onClick={handleClick}
      >
        {level > 0 && renderIndentGuides()}
        {node.type === 'folder' && (
          <ChevronRight
            size={16}
            strokeWidth={2}
            className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            style={{ color: '#b6b6b6' }}
          />
        )}
        <span className="truncate">
          {node.name.replace('.md', '')}
        </span>
      </div>
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children
            .filter(child => !child.name.startsWith('.'))
            .map((child, index) => (
              <FileTreeNode
                key={`${child.path}-${index}`}
                node={child}
                onFileClick={onFileClick}
                level={level + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeComponentProps {
  tree: FileNode | null;
  onFileClick?: (path: string) => void;
}

export const FileTree: React.FC<FileTreeComponentProps> = ({ tree, onFileClick }) => {
  if (!tree) {
    return (
      <div className="p-4 text-obsidian-text-muted text-sm">No vault loaded</div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto pt-1">
      {/* Skip root folder, render its children directly - no header like Obsidian */}
      {tree.children
        ?.filter(child => !child.name.startsWith('.'))
        .map((child, index) => (
          <FileTreeNode
            key={`${child.path}-${index}`}
            node={child}
            onFileClick={onFileClick}
            level={0}
          />
        ))}
    </div>
  );
};
