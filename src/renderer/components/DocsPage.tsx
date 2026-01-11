import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { docPages } from '../data/docs';

interface DocsPageProps {
  docId: string;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({
  docId,
  canGoBack,
  canGoForward,
  goBack,
  goForward,
}) => {
  const doc = docPages[docId];

  if (!doc) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-center" style={{ paddingTop: '16px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '24px' }}>
          <div className="flex items-center gap-2">
            <button
              className={`p-1 rounded transition-colors ${canGoBack ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
              style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
              title="Back"
              onClick={goBack}
              disabled={!canGoBack}
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              className={`p-1 rounded transition-colors ${canGoForward ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
              style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
              title="Forward"
              onClick={goForward}
              disabled={!canGoForward}
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Page Not Found
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              This documentation page doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            {listItems.map((item, i) => (
              <li key={i} style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <table key={`table-${elements.length}`} style={{ marginBottom: '16px', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {tableRows[0]?.map((cell, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--border-primary)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(2).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, i) => (
                    <td key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-primary)', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {renderInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const renderInlineMarkdown = (text: string): React.ReactNode => {
      // Handle inline code
      const parts = text.split(/(`[^`]+`)/g);
      return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        // Handle bold
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
          if (bp.startsWith('**') && bp.endsWith('**')) {
            return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
          }
          return bp;
        });
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${elements.length}`} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', overflow: 'auto' }}>
              <code style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                {codeContent.join('\n')}
              </code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          flushList();
          flushTable();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Table rows
      if (line.startsWith('|')) {
        flushList();
        const cells = line.split('|').filter(c => c.trim() !== '');
        if (cells.length > 0) {
          if (!inTable) inTable = true;
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headers
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${elements.length}`} style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', marginTop: i > 0 ? '32px' : '0' }}>
            {line.slice(2)}
          </h1>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${elements.length}`} style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', marginTop: '28px' }}>
            {line.slice(3)}
          </h2>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${elements.length}`} style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', marginTop: '24px' }}>
            {line.slice(4)}
          </h3>
        );
        continue;
      }

      // List items
      if (line.startsWith('- ')) {
        listItems.push(line.slice(2));
        continue;
      } else if (listItems.length > 0) {
        flushList();
      }

      // Empty line
      if (line.trim() === '') {
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${elements.length}`} style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)', marginBottom: '16px' }}>
          {renderInlineMarkdown(line)}
        </p>
      );
    }

    flushList();
    flushTable();

    return elements;
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation bar */}
      <div className="flex items-center" style={{ paddingTop: '16px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '24px' }}>
        <div className="flex items-center gap-2">
          <button
            className={`p-1 rounded transition-colors ${canGoBack ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
            style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
            title="Back"
            onClick={goBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            className={`p-1 rounded transition-colors ${canGoForward ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
            style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
            title="Forward"
            onClick={goForward}
            disabled={!canGoForward}
          >
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 48px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {renderContent(doc.content)}
        </div>
      </div>
    </div>
  );
};
