import React from 'react';

export const CharacterGridSkeleton: React.FC<{ count?: number; inline?: boolean }> = ({ count = 8, inline = false }) => {
  const cards = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      style={{
        background: '#182234',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 330,
      }}
    >
      {/* Photo Skeleton */}
      <div className="skeleton" style={{ height: 145, borderRadius: 0, borderBottom: '1px solid #1e293b' }} />

      {/* Info Skeleton */}
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 6 }} />

        {/* Aliases */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <div className="skeleton" style={{ height: 14, width: 50, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 4 }} />
        </div>

        {/* First Appearance */}
        <div className="skeleton" style={{ height: 18, width: '85%', borderRadius: 4, marginBottom: 8 }} />

        {/* Description lines */}
        <div className="skeleton" style={{ height: 11, width: '95%', marginBottom: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '85%', marginBottom: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '60%', marginBottom: 4 }} />

        {/* Footer link */}
        <div className="skeleton" style={{ height: 12, width: '45%', marginTop: 'auto' }} />
      </div>
    </div>
  ));

  if (inline) {
    return <>{cards}</>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
      {cards}
    </div>
  );
};

export const SidebarWorksSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #172133',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {/* Cover thumbnail */}
          <div className="skeleton" style={{ width: 44, height: 60, borderRadius: 6, flexShrink: 0 }} />

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="skeleton" style={{ height: 15, width: '80%', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <div className="skeleton" style={{ height: 16, width: 55, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 16, width: 45, borderRadius: 4 }} />
            </div>
            <div className="skeleton" style={{ height: 5, width: '100%', borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const JournalSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner de Progresso */}
      <div className="skeleton" style={{ height: 95, borderRadius: 10, width: '100%' }} />

      {/* Título de seção */}
      <div className="skeleton" style={{ height: 20, width: 180, margin: '8px 0 4px 0' }} />

      {/* Lista de entradas do diário */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: 64,
            borderRadius: 8,
            width: '100%',
          }}
        />
      ))}
    </div>
  );
};

export const AttachmentGridSkeleton: React.FC<{ count?: number; inline?: boolean }> = ({ count = 4, inline = false }) => {
  const cards = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      style={{
        background: '#182234',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 16,
        height: 190,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 18, width: '60%' }} />
        <div className="skeleton" style={{ height: 18, width: 50, borderRadius: 4 }} />
      </div>
      <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '35%', marginTop: 'auto' }} />
    </div>
  ));

  if (inline) {
    return <>{cards}</>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {cards}
    </div>
  );
};

export const JournalItemsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: '#090e17',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="skeleton" style={{ height: 18, width: 140, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 4 }} />
          </div>
          <div className="skeleton" style={{ height: 12, width: '75%', borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 12, width: '45%', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
};
