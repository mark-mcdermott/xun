import React, { useState } from 'react';
import type { FileNode } from '../../preload';

interface FileTreeProps {
  node: FileNode;
  onFileClick?: (path: string) => void;
  level?: number;
}

const FileTreeNode: React.FC<FileTreeProps> = ({ node, onFileClick, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick?.(node.path);
    }
  };

  const icon = node.type === 'folder' ? (isExpanded ? '📂' : '📁') : '📄';
  const indentStyle = { paddingLeft: `${level * 16}px` };

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
        style={indentStyle}
        onClick={handleClick}
      >
        <span className="text-base">{icon}</span>
        <span className="text-gray-800">{node.name}</span>
      </div>
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
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
      <div className="p-4 text-gray-500 text-sm">No vault loaded</div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-white border-r border-gray-200">
      <div className="p-2 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-600 uppercase">Files</h3>
      </div>
      <FileTreeNode node={tree} onFileClick={onFileClick} level={0} />
    </div>
  );
};
