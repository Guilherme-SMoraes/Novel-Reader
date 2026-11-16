import { useEffect, useState } from 'react';
import type { Attachment, Character, Genre, Progress, ReadingStatus, Work, WorkType } from './types';
import { attachmentsApi, charactersApi, genresApi, progressApi, worksApi } from './services/api';
import { Sidebar } from './components/Sidebar';
import { WorkDetail } from './components/WorkDetail';
import { WorkModal } from './components/WorkModal';
import { ManageGenresModal } from './components/ManageGenresModal';
import { BookOpen } from 'lucide-react';

export function App() {
  const [works, setWorks] = useState<Work[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);

  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Filtros
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null);
  const [selectedType, setSelectedType] = useState<WorkType | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);

  // Modais
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [workToEdit, setWorkToEdit] = useState<Work | null>(null);
  const [isManageGenresOpen, setIsManageGenresOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchGenres = async () => {
    try {
      const res = await genresApi.getAll();
      setGenres(res.items);
    } catch (err) {
      console.error('Erro ao carregar gêneros:', err);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await worksApi.getAll({
        title: searchTitle || undefined,
        workType: selectedType || undefined,
        genreId: selectedGenreId || undefined,
        readingStatus: selectedStatus || undefined,
      });

      setWorks(res.items);

      if (res.items.length > 0) {
        if (!selectedWorkId || !res.items.some((w) => w.id === selectedWorkId)) {
          setSelectedWorkId(res.items[0].id);
        }
      } else {
        setSelectedWorkId(null);
      }
    } catch (err) {
      console.error('Erro ao buscar obras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorks();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTitle, selectedStatus, selectedType, selectedGenreId]);

  const fetchWorkDetails = async (workId: string) => {
    setLoadingDetails(true);
    try {
      const [progRes, charRes, attRes] = await Promise.all([
        progressApi.getByWorkId(workId),
        charactersApi.getByWorkId(workId),
        attachmentsApi.getByWorkId(workId),
      ]);
      setProgressList(progRes.items);
      setCharacters(charRes.items);
      setAttachments(attRes);
    } catch (err) {
      console.error('Erro ao buscar detalhes da obra:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (selectedWorkId) {
      fetchWorkDetails(selectedWorkId);
    } else {
      setProgressList([]);
      setCharacters([]);
      setAttachments([]);
    }
  }, [selectedWorkId]);

  const selectedWork = works.find((w) => w.id === selectedWorkId);

  const handleResetFilters = () => {
    setSearchTitle('');
    setSelectedStatus(null);
    setSelectedType(null);
    setSelectedGenreId(null);
  };

  const handleOpenCreateWork = () => {
    setWorkToEdit(null);
    setIsWorkModalOpen(true);
  };

  const handleOpenEditWork = () => {
    if (selectedWork) {
      setWorkToEdit(selectedWork);
      setIsWorkModalOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar com Lista e Filtros */}
      <Sidebar
        works={works}
        loading={loading}
        selectedWorkId={selectedWorkId}
        onSelectWork={setSelectedWorkId}
        onOpenCreateWork={handleOpenCreateWork}
        genres={genres}
        searchTitle={searchTitle}
        onSearchTitleChange={setSearchTitle}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedGenreId={selectedGenreId}
        onGenreChange={setSelectedGenreId}
        onResetFilters={handleResetFilters}
        onOpenManageGenres={() => setIsManageGenresOpen(true)}
      />

      {/* Painel Principal */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {loading && works.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Carregando sua biblioteca...
          </div>
        ) : selectedWork ? (
          <WorkDetail
            work={selectedWork}
            loading={loadingDetails}
            progressList={progressList}
            characters={characters}
            attachments={attachments}
            onDataUpdated={() => {
              fetchWorkDetails(selectedWork.id);
              fetchWorks();
            }}
            onWorkDeleted={fetchWorks}
            onOpenEditWork={handleOpenEditWork}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: 32 }}>
            <BookOpen size={48} color="#6366f1" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.25rem', color: '#e2e8f0', marginBottom: 6 }}>Nenhuma obra selecionada</h2>
            <p style={{ fontSize: '0.88rem', maxWidth: 400, textAlign: 'center', marginBottom: 20 }}>
              {works.length === 0
                ? 'Você ainda não cadastrou nenhuma obra ou nenhuma corresponde aos filtros atuais.'
                : 'Selecione uma obra na lista lateral para visualizar os detalhes, progresso e personagens.'}
            </p>
            <button onClick={handleOpenCreateWork} className="btn-primary">
              Cadastrar Primeira Obra
            </button>
          </div>
        )}
      </main>

      {/* Modal para Cadastrar / Editar Obra */}
      <WorkModal
        isOpen={isWorkModalOpen}
        workToEdit={workToEdit}
        genres={genres}
        onClose={() => {
          setIsWorkModalOpen(false);
          setWorkToEdit(null);
        }}
        onSaved={fetchWorks}
        onOpenManageGenres={() => setIsManageGenresOpen(true)}
      />

      {/* Modal para Gerenciar Gêneros */}
      <ManageGenresModal
        isOpen={isManageGenresOpen}
        genres={genres}
        onClose={() => setIsManageGenresOpen(false)}
        onGenresUpdated={() => {
          fetchGenres();
          fetchWorks();
        }}
      />
    </div>
  );
}

export default App;
