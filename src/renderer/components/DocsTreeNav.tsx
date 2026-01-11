import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { docsTree, DocSection, findParentSection } from '../data/docs';

interface DocsTreeNavProps {
  currentDocId: string;
  onDocClick: (docId: string) => void;
}

export const DocsTreeNav: React.FC<DocsTreeNavProps> = ({ currentDocId, onDocClick }) => {
  // Start with the parent section of the current doc expanded
  const initialExpanded = new Set<string>();
  const parentSection = findParentSection(currentDocId);
  if (parentSection) {
    initialExpanded.add(parentSection);
  }
  // Also expand any section that contains the current doc
  for (const section of docsTree) {
    if (section.children?.some(child => child.id === currentDocId)) {
      initialExpanded.add(section.id);
    }
  }

  const [expandedSections, setExpandedSections] = useState<Set<string>>(initialExpanded);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderSection = (section: DocSection, depth: number = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const paddingLeft = 12 + depth * 16;

    if (hasChildren) {
      return (
        <div key={section.id}>
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center gap-1 px-2 hover:bg-[var(--sidebar-hover)] rounded transition-colors text-left"
            style={{
              paddingLeft: `${paddingLeft}px`,
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
              fontSize: '13.75px',
              lineHeight: '2',
            }}
          >
            {isExpanded ? (
              <ChevronDown size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            ) : (
              <ChevronRight size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: 500 }}>{section.title}</span>
          </button>
          {isExpanded && (
            <div>
              {section.children!.map(child => renderSection(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Leaf node (actual doc page)
    const isActive = section.id === currentDocId;

    return (
      <button
        key={section.id}
        onClick={() => onDocClick(section.id)}
        className="w-full flex items-center gap-2 px-2 hover:bg-[var(--sidebar-hover)] rounded transition-colors text-left"
        style={{
          paddingLeft: `${paddingLeft + 18}px`,
          backgroundColor: 'transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          fontSize: '13.75px',
          lineHeight: '2',
        }}
      >
        <FileText size={14} strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.7, marginRight: '4px' }} />
        <span style={{ fontWeight: isActive ? 500 : 400 }}>{section.title}</span>
      </button>
    );
  };

  return (
    <div className="py-2">
      <div style={{ padding: '0 12px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Documentation
        </h3>
      </div>
      <div>
        {docsTree.map(section => renderSection(section))}
      </div>
    </div>
  );
};
