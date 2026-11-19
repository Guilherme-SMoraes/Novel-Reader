import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Attachment } from '../types';
import { attachmentsApi } from '../services/api';
import { useModalDock } from '../context/ModalDockContext';
import { usePopoutModal } from '../hooks/usePopoutModal';
import { MarkdownViewer } from './MarkdownViewer';
import { ImageInput } from './ImageInput';
import {
  X,
  Minus,
  Bold,
  Italic,
  Heading3,
  List,
  Table as TableIcon,
  Quote,
  Code,
  Sparkles,
  Eye,
  Edit3,
  ExternalLink,
  ArrowDownLeft,
} from 'lucide-react';

interface Props {
  sessionId?: string;
  isOpen: boolean;
  workId: string;
  attachmentToEdit?: Attachment | null;
  existingCategories?: string[];
  onClose: () => void;
  onSaved: () => void;
}

const PRESET_CATEGORIES = [
  'Mapa',
  'Sistema de Poder',
  'Locais',
  'Lore',
  'Bestiário',
  'Facções',
  'Outro',
];

const TEMPLATES = [
  {
    id: 'power_system',
    name: 'Sistema de Poder / Ranks',
    markdown: `### Sistema de Poder & Classificação

| Rank / Nível | Designação | Capacidades | Requisitos |
| :--- | :--- | :--- | :--- |
| **Rank F** | Desperto Inicial | Percepção de éter e mana básica | Despertar da alma |
| **Rank E** | Guerreiro Étereo | Fortalecimento muscular e sentidos aguçados | Núcleo de mana condensado |
| **Rank D** | Mestre Elemental | Manipulação direta de elementos | Abertura dos meridianos |
| **Rank C** | Santo Marcial | Projeção de aura cortante a distância | Domínio do domínio espiritual |
| **Rank S** | Monarca Supremo | Distorção espacial e quebra de leis | Fragmento divino assimilado |

> [!NOTE]
> Usuários com aspectos lendários ou linhagens ancestrais podem saltar estágios temporariamente.`,
  },
  {
    id: 'status_attributes',
    name: 'Ficha de Status / Atributos',
    markdown: `### Ficha de Status & Habilidades

| Atributo | Valor / Nível | Efeito & Descrição |
| :--- | :--- | :--- |
| **Força** | 120 | Capacidade de carga destrutiva e impacto físico |
| **Agilidade** | 145 | Velocidade de reflexo, esquiva e aceleração |
| **Vitalidade** | 98 | Regeneração celular e resistência a toxinas |
| **Mana / Éter** | 350 / 350 | Reserva energética para ativação de runas |

#### Habilidades Especiais
- **Passo das Sombras**: Teletransporte instantâneo entre sombras até 20m.
- **Olhar da Verdade**: Revela fraquezas de inimigos até 2 ranks acima.`,
  },
  {
    id: 'factions',
    name: 'Facções / Relações de Poder',
    markdown: `### Facções & Relações de Poder

| Organização | Líder | Território / Sede | Alinhamento | Relação |
| :--- | :--- | :--- | :--- | :--- |
| **Clã Supremo** | Patriarca Chen | Cordilheira do Norte | Nobreza Tradicional | Neutro |
| **Associação de Caçadores** | Grande Mestre Kai | Capital Central | Regulador Global | Aliado |
| **Culto do Abismo** | Inominável | Terras Devastadas | Caótico | Hostil |`,
  },
];

export const AttachmentModal: React.FC<Props> = ({
  sessionId,
  isOpen,
  workId,
  attachmentToEdit,
  existingCategories = [],
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mapa');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isMinimized, setIsMinimized] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { minimizeModal, closeModal, updateModalTitle } = useModalDock();
  const effectiveSessionId = sessionId || (attachmentToEdit ? `att-edit-${attachmentToEdit.id}` : 'att-create');
  const modalTitle = attachmentToEdit ? `Anexo: ${attachmentToEdit.title}` : 'Novo Anexo';

  const {
    isSupported: isPopoutSupported,
    isPoppedOut,
    popoutContainer,
    openPopout,
    closePopout,
  } = usePopoutModal(modalTitle);

  useEffect(() => {
    if (attachmentToEdit) {
      setTitle(attachmentToEdit.title);
      if (PRESET_CATEGORIES.includes(attachmentToEdit.category)) {
        setCategory(attachmentToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Outro');
        setCustomCategory(attachmentToEdit.category);
      }
      setImageUrl(attachmentToEdit.imageUrl || '');
      setContent(attachmentToEdit.content || '');
    } else {
      setTitle('');
      setCategory('Mapa');
      setCustomCategory('');
      setImageUrl('');
      setContent('');
    }
    setError(null);
    setActiveTab('write');
  }, [attachmentToEdit, isOpen]);

  useEffect(() => {
    if (isMinimized) {
      updateModalTitle(
        effectiveSessionId,
        title.trim() || (attachmentToEdit ? attachmentToEdit.title : 'Novo Anexo')
      );
    }
  }, [title, isMinimized, effectiveSessionId, attachmentToEdit]);

  const handleMinimize = () => {
    if (isPoppedOut) {
      closePopout();
    }
    setIsMinimized(true);
    minimizeModal({
      id: effectiveSessionId,
      title: title.trim() || (attachmentToEdit ? attachmentToEdit.title : 'Novo Anexo'),
      type: 'attachment',
      onRestore: () => setIsMinimized(false),
      onClose: handleClose,
    });
  };

  const handleClose = () => {
    if (isPoppedOut) {
      closePopout();
    }
    closeModal(effectiveSessionId);
    onClose();
  };

  const handleTogglePopout = async () => {
    if (isPoppedOut) {
      closePopout();
    } else {
      await openPopout({
        title: title.trim() || (attachmentToEdit ? attachmentToEdit.title : 'Novo Anexo'),
        width: 760,
        height: 750,
      });
    }
  };

  if (!isOpen || isMinimized) return null;

  const insertAtCursor = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + prefix + defaultText + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = prefix + selectedText + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleInsertTable = () => {
    const sampleTable = `\n| Coluna 1 | Coluna 2 | Coluna 3 |\n| :--- | :--- | :--- |\n| Exemplo A | Detalhe | Informação |\n| Exemplo B | Detalhe | Informação |\n`;
    insertAtCursor('', sampleTable);
  };

  const handleApplyTemplate = (templateMarkdown: string) => {
    if (!content.trim()) {
      setContent(templateMarkdown);
    } else {
      setContent((prev) => prev + '\n\n' + templateMarkdown);
    }
    setActiveTab('preview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCategory = category === 'Outro' && customCategory.trim() ? customCategory.trim() : category;

    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    if (!finalCategory.trim()) {
      setError('A categoria é obrigatória.');
      return;
    }

    setLoading(true);
    try {
      if (attachmentToEdit) {
        await attachmentsApi.update(attachmentToEdit.id, {
          title: title.trim(),
          category: finalCategory,
          imageUrl: imageUrl.trim() || null,
          content: content.trim() || null,
        });
      } else {
        await attachmentsApi.create(workId, {
          title: title.trim(),
          category: finalCategory,
          imageUrl: imageUrl.trim() || null,
          content: content.trim() || null,
        });
      }
      if (isPoppedOut) {
        closePopout();
      }
      closeModal(effectiveSessionId);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar anexo.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className={isPoppedOut ? '' : 'modal-content'}
      style={
        isPoppedOut
          ? {
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              width: '100vw',
              background: '#0f172a',
              color: '#f8fafc',
              overflowY: 'auto',
              padding: 20,
              boxSizing: 'border-box',
            }
          : { maxWidth: '760px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }
      }
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          {attachmentToEdit ? 'Editar Anexo' : 'Novo Anexo da Obra'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isPopoutSupported && (
            <button
              type="button"
              className="btn-icon"
              onClick={handleTogglePopout}
              title={isPoppedOut ? 'Reanexar à janela principal' : 'Destacar em Pop-up (Picture-in-Picture)'}
              style={{
                color: isPoppedOut ? '#38bdf8' : 'var(--text-muted)',
                background: isPoppedOut ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              }}
            >
              {isPoppedOut ? <ArrowDownLeft size={18} /> : <ExternalLink size={18} />}
            </button>
          )}
          {!isPoppedOut && (
            <button
              type="button"
              className="btn-icon"
              onClick={handleMinimize}
              title="Minimizar formulário"
              style={{ color: 'var(--text-muted)' }}
            >
              <Minus size={18} />
            </button>
          )}
          <button
            type="button"
            className="btn-icon"
            onClick={handleClose}
            title="Fechar"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

        {error && (
          <div style={{ padding: '10px', background: '#7f1d1d', borderRadius: '6px', color: '#fca5a5', marginBottom: '14px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Categoria *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (cat !== 'Outro') setCustomCategory('');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: category === cat ? '#3b82f6' : '#1e293b',
                    color: category === cat ? '#fff' : '#cbd5e1',
                    borderColor: category === cat ? '#60a5fa' : '#334155',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {category === 'Outro' && (
              <div style={{ marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="Digite o nome da nova categoria (ex: Itens Sagrados, Magias...)"
                  className="input-text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  list="custom-category-suggestions"
                  required
                />
                <datalist id="custom-category-suggestions">
                  {existingCategories
                    .filter((c) => !PRESET_CATEGORIES.includes(c))
                    .map((c, i) => (
                      <option key={i} value={c} />
                    ))}
                </datalist>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Título do Anexo *
            </label>
            <input
              type="text"
              placeholder="Ex: Mapa do Continente Sul, Hierarquia de Cultivo..."
              className="input-text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <ImageInput
            label="URL da Imagem / Mapa (opcional)"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="https://exemplo.com/imagem.png ou envie um arquivo"
            disabled={loading}
          />

          {/* Markdown Content Section with Toolbar & Tabs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Conteúdo / Lore Formatada (Markdown e Tabelas)
              </label>

              {/* Write / Preview Tab Toggles */}
              <div style={{ display: 'flex', background: '#0f172a', borderRadius: '6px', padding: '2px', border: '1px solid #334155' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
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
                  onClick={() => setActiveTab('preview')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
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

            {/* Formatting Toolbar */}
            {activeTab === 'write' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '4px',
                  padding: '6px 8px',
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
                  style={{ padding: '4px 6px', color: '#cbd5e1' }}
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Itálico (*texto*)"
                  onClick={() => insertAtCursor('*', '*', 'texto')}
                  style={{ padding: '4px 6px', color: '#cbd5e1' }}
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Título / Seção (### Título)"
                  onClick={() => insertAtCursor('\n### ', '\n', 'Título da Seção')}
                  style={{ padding: '4px 6px', color: '#cbd5e1' }}
                >
                  <Heading3 size={15} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Lista (- Item)"
                  onClick={() => insertAtCursor('\n- ', '\n', 'Item da lista')}
                  style={{ padding: '4px 6px', color: '#cbd5e1' }}
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Inserir Tabela Bonita"
                  onClick={handleInsertTable}
                  style={{ padding: '4px 6px', color: '#38bdf8' }}
                >
                  <TableIcon size={15} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Citação / Nota de Lore (> Nota)"
                  onClick={() => insertAtCursor('\n> ', '\n', 'Nota importante')}
                  style={{ padding: '4px 6px', color: '#cbd5e1' }}
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Código em linha (`código`)"
                  onClick={() => insertAtCursor('`', '`', 'código')}
                  style={{ padding: '4px 6px', color: '#cbd5e1' }}
                >
                  <Code size={15} />
                </button>

                <div style={{ width: '1px', height: '18px', background: '#334155', margin: '0 4px' }} />

                {/* Templates Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#f59e0b" />
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const template = TEMPLATES.find((t) => t.id === e.target.value);
                      if (template) handleApplyTemplate(template.markdown);
                      e.target.value = '';
                    }}
                    style={{
                      background: '#0f172a',
                      color: '#94a3b8',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled>Inserir Modelo Pronto...</option>
                    {TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'write' ? (
              <textarea
                ref={textareaRef}
                rows={9}
                placeholder="Escreva descrições, notas, listas ou tabelas em Markdown..."
                className="input-text"
                style={{
                  resize: 'vertical',
                  borderRadius: '0 0 6px 6px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.85rem',
                }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div
                style={{
                  minHeight: '200px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  background: '#0b1120',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '16px',
                }}
              >
                {content.trim() ? (
                  <MarkdownViewer content={content} />
                ) : (
                  <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                    Nenhum conteúdo para pré-visualizar. Digite na aba "Escrever" ou escolha um Modelo Pronto.
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : attachmentToEdit ? 'Atualizar Anexo' : 'Salvar Anexo'}
            </button>
          </div>
        </form>
      </div>
    );

  if (isPoppedOut && popoutContainer) {
    return createPortal(modalContent, popoutContainer);
  }

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={handleClose} />
      {modalContent}
    </div>,
    document.body
  );
};
