import React from 'react';
import {
  Bold,
  Italic,
  Heading3,
  List,
  Quote,
  Code,
  Table as TableIcon,
  Edit3,
  Eye,
} from 'lucide-react';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  activeTab: 'write' | 'preview';
  onTabChange: (tab: 'write' | 'preview') => void;
  showTable?: boolean;
  tableSample?: string;
  label?: string;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  activeTab,
  onTabChange,
  showTable = true,
  tableSample,
  label = 'Descrição e Notas (Markdown)',
}) => {
  const insertAtCursor = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + prefix + defaultText + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = prefix + selectedText + suffix;
    const newContent = value.substring(0, start) + replacement + value.substring(end);
    onChange(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleInsertTable = () => {
    const defaultTable = `\n| Item | Detalhe |\n| :--- | :--- |\n| Exemplo 1 | Informação |\n| Exemplo 2 | Informação |\n`;
    insertAtCursor('', tableSample || defaultTable);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {label}
        </label>

        <div style={{ display: 'flex', background: '#0f172a', borderRadius: 6, padding: 2, border: '1px solid #334155' }}>
          <button
            type="button"
            onClick={() => onTabChange('write')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              fontSize: '0.75rem',
              borderRadius: 4,
              background: activeTab === 'write' ? '#1e293b' : 'transparent',
              color: activeTab === 'write' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'write' ? 600 : 400,
            }}
          >
            <Edit3 size={13} /> Escrever
          </button>
          <button
            type="button"
            onClick={() => onTabChange('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              fontSize: '0.75rem',
              borderRadius: 4,
              background: activeTab === 'preview' ? '#1e293b' : 'transparent',
              color: activeTab === 'preview' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'preview' ? 600 : 400,
            }}
          >
            <Eye size={13} /> Pré-visualizar
          </button>
        </div>
      </div>

      {activeTab === 'write' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 4,
            padding: '5px 8px',
            background: '#1e293b',
            borderRadius: '6px 6px 0 0',
            border: '1px solid #334155',
            borderBottom: 'none',
          }}
        >
          <button
            type="button"
            className="btn-icon"
            title="Negrito (**texto**)"
            onClick={() => insertAtCursor('**', '**', 'texto')}
            style={{ padding: '3px 5px', color: '#cbd5e1' }}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            title="Itálico (*texto*)"
            onClick={() => insertAtCursor('*', '*', 'texto')}
            style={{ padding: '3px 5px', color: '#cbd5e1' }}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            title="Título (### Título)"
            onClick={() => insertAtCursor('\n### ', '\n', 'Título')}
            style={{ padding: '3px 5px', color: '#cbd5e1' }}
          >
            <Heading3 size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            title="Lista com marcadores (- item)"
            onClick={() => insertAtCursor('\n- ', '', 'Item da lista')}
            style={{ padding: '3px 5px', color: '#cbd5e1' }}
          >
            <List size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            title="Citação (> citação)"
            onClick={() => insertAtCursor('\n> ', '', 'Citação')}
            style={{ padding: '3px 5px', color: '#cbd5e1' }}
          >
            <Quote size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            title="Código inline (`código`)"
            onClick={() => insertAtCursor('`', '`', 'código')}
            style={{ padding: '3px 5px', color: '#cbd5e1' }}
          >
            <Code size={14} />
          </button>
          {showTable && (
            <button
              type="button"
              className="btn-icon"
              title="Inserir Tabela"
              onClick={handleInsertTable}
              style={{ padding: '3px 5px', color: '#cbd5e1' }}
            >
              <TableIcon size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
