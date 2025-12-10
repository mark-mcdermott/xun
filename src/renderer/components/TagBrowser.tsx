import React from 'react';

interface TagBrowserProps {
  tags: string[];
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
}

export const TagBrowser: React.FC<TagBrowserProps> = ({ tags, selectedTag, onTagClick }) => {
  if (tags.length === 0) {
    return (
      <div className="p-4 text-obsidian-text-muted text-sm">
        No tags found. Start writing with tags like <span className="text-accent">#project-a</span> in your notes!
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto pt-1">
      {tags.map(tag => (
        <div
          key={tag}
          onClick={() => onTagClick(tag)}
          className={`flex items-center gap-1 pr-2 cursor-pointer hover:bg-[var(--sidebar-hover)]`}
          style={{
            fontSize: '13.75px',
            color: selectedTag === tag ? 'var(--text-primary)' : 'var(--sidebar-text)',
            lineHeight: '2',
            paddingLeft: '8px',
            backgroundColor: selectedTag === tag ? 'var(--sidebar-hover)' : 'transparent'
          }}
        >
          <span style={{ color: 'var(--sidebar-text)' }}>#</span>
          <span className="truncate">
            {tag.substring(1)}
          </span>
        </div>
      ))}
    </div>
  );
};
