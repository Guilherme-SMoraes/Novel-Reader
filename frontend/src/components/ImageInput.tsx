import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { imagesApi } from '../services/api';

interface ImageInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label = 'Imagem',
  value,
  onChange,
  placeholder = 'https://exemplo.com/imagem.png ou cole/arraste um arquivo',
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF, WEBP).');
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      setUploadError('O arquivo excede o limite máximo de 32MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const response = await imagesApi.upload(file);
      onChange(response.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha no upload da imagem.';
      setUploadError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled || uploading) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFileUpload(file);
          return;
        }
      }
    }
  };

  return (
    <div style={{ width: '100%' }} onPaste={handlePaste}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed #38bdf8' : '1px solid #334155',
          borderRadius: 8,
          padding: 8,
          background: isDragging ? 'rgba(56, 189, 248, 0.08)' : '#0f172a',
          transition: 'border-color 0.2s, background-color 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {value ? (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 6,
                backgroundImage: `url('${value}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid #334155',
                flexShrink: 0,
                position: 'relative',
              }}
              title="Prévia da imagem"
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 6,
                border: '1px dashed #475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                flexShrink: 0,
                background: '#1e293b',
              }}
              title="Sem imagem"
            >
              <ImageIcon size={20} />
            </div>
          )}

          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="url"
              className="input-text"
              style={{ width: '100%', paddingRight: value ? 32 : 8 }}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled || uploading}
            />
            {value && !disabled && !uploading && (
              <button
                type="button"
                onClick={() => onChange('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Limpar URL"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              height: 38,
              padding: '0 12px',
              fontSize: '0.8rem',
            }}
            title="Escolher arquivo do computador"
          >
            {uploading ? (
              <>
                <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload size={15} />
                <span>Enviar Imagem</span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', fontSize: '0.72rem', color: '#64748b' }}>
          <span>Dica: você pode colar da área de transferência (Ctrl + V) ou arrastar um arquivo aqui</span>
          {uploading && <span style={{ color: '#38bdf8' }}>Enviando para ImgBB...</span>}
        </div>
      </div>

      {uploadError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 6,
            padding: '6px 10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            borderRadius: 6,
            color: '#fca5a5',
            fontSize: '0.78rem',
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
