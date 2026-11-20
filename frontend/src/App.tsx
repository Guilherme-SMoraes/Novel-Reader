import { useEffect, useState, useRef } from 'react';
import type { Attachment, Character, Genre, Progress, ReadingStatus, Work, WorkType } from './types';
import { attachmentsApi, charactersApi, genresApi, progressApi, worksApi } from './services/api';
import { Sidebar } from './components/Sidebar';
import { WorkDetail } from './components/WorkDetail';
import { WorkModal } from './components/WorkModal';
import { ManageGenresModal } from './components/ManageGenresModal';
import { LoginPage } from './components/LoginPage';
import { ColdStartOverlay } from './components/ColdStartOverlay';
import { useKeepAlive } from './hooks/useKeepAlive';
import { useAuth } from './context/AuthContext';
import { BookOpen } from 'lucide-react';
import { getNavParams, updateNavParams } from './utils/navigationState';
import { getActiveDraftMeta, cleanupExpiredDrafts } from './utils/formDrafts';

export function App() {
  useKeepAlive();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const initialNav = useState(() => getNavParams())[0];
  const [works, setWorks] = useState<Work[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(initialNav.workId);
  const [currentWork, setCurrentWork] = useState<Work | null>(null);
  const selectedWorkIdRef = useRef<string | null>(initialNav.workId);

  useEffect(() => {
    selectedWorkIdRef.current = selectedWorkId;
  }, [selectedWorkId]);

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
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return initialNav.workId ? 'detail' : 'list';
    }
    return 'detail';
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileView('detail');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectWork = (id: string) => {
    const existing = works.find((w) => w.id === id);
    if (existing) {
      setCurrentWork(existing);
    }
    setSelectedWorkId(id);
    selectedWorkIdRef.current = id;
    updateNavParams({ workId: id });
    if (isMobile) {
      setMobileView('detail');
    }
  };

  const handleBackToLibrary = () => {
    setSelectedWorkId(null);
    selectedWorkIdRef.current = null;
    setCurrentWork(null);
    updateNavParams({ workId: null });
    setMobileView('list');
  };

  const fetchGenres = async () => {
    try {
      const res = await genresApi.getAll();
      setGenres(res.items);
    } catch (err) {
      console.error('Erro ao carregar gêneros:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      cleanupExpiredDrafts();
      fetchGenres();
      const activeDraft = getActiveDraftMeta();
      if (activeDraft) {
        if (activeDraft.type === 'work') {
          if (activeDraft.mode === 'create') {
            setWorkToEdit(null);
            setIsWorkModalOpen(true);
          } else if (activeDraft.mode === 'edit' && activeDraft.entityId) {
            worksApi
              .getById(activeDraft.entityId)
              .then((w) => {
                setWorkToEdit(w);
                setIsWorkModalOpen(true);
              })
              .catch((err) => {
                console.error('Failed to load work for draft restoration', err);
              });
          }
        } else if (activeDraft.workId) {
          setSelectedWorkId(activeDraft.workId);
          selectedWorkIdRef.current = activeDraft.workId;
          const targetTab =
            activeDraft.type === 'progress'
              ? 'journal'
              : activeDraft.type === 'character'
              ? 'characters'
              : 'attachments';
          updateNavParams({ workId: activeDraft.workId, tab: targetTab });
          if (isMobile) {
            setMobileView('detail');
          }
        }
      }

      if (!selectedWorkIdRef.current) {
        const nav = getNavParams();
        if (nav.workId) {
          setSelectedWorkId(nav.workId);
          selectedWorkIdRef.current = nav.workId;
          if (isMobile) {
            setMobileView('detail');
          }
        }
      }
    } else if (!authLoading) {
      setGenres([]);
      setWorks([]);
      setSelectedWorkId(null);
      selectedWorkIdRef.current = null;
      setCurrentWork(null);
    }
  }, [isAuthenticated, authLoading, isMobile]);

  const [worksPage, setWorksPage] = useState(1);
  const [hasMoreWorks, setHasMoreWorks] = useState(false);
  const [loadingMoreWorks, setLoadingMoreWorks] = useState(false);
  const fetchWorksAbortControllerRef = useRef<AbortController | null>(null);

  const fetchWorks = async () => {
    if (!isAuthenticated) return;
    if (fetchWorksAbortControllerRef.current) {
      fetchWorksAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    fetchWorksAbortControllerRef.current = abortController;

    try {
      setLoading(true);
      const res = await worksApi.getAll(
        {
          title: searchTitle || undefined,
          workType: selectedType || undefined,
          genreId: selectedGenreId || undefined,
          readingStatus: selectedStatus || undefined,
          page: 1,
          pageSize: 20,
        },
        abortController.signal
      );

      setWorks((prev) => {
        const activeId = selectedWorkIdRef.current;
        const currentActive = activeId ? prev.find((w) => w.id === activeId) : null;
        if (currentActive && !res.items.some((w) => w.id === activeId)) {
          return [currentActive, ...res.items];
        }
        return res.items;
      });
      setWorksPage(1);
      setHasMoreWorks(res.page < res.totalPages);

      const currentActiveId = selectedWorkIdRef.current;
      if (!currentActiveId && !isMobile && res.items.length > 0) {
        setSelectedWorkId(res.items[0].id);
        selectedWorkIdRef.current = res.items[0].id;
        updateNavParams({ workId: res.items[0].id });
      } else if (!currentActiveId && res.items.length === 0) {
        setSelectedWorkId(null);
        selectedWorkIdRef.current = null;
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      console.error('Erro ao buscar obras:', err);
    } finally {
      if (fetchWorksAbortControllerRef.current === abortController) {
        setLoading(false);
      }
    }
  };

  const fetchMoreWorks = async () => {
    if (!isAuthenticated || loadingMoreWorks || !hasMoreWorks) return;
    try {
      setLoadingMoreWorks(true);
      const nextPage = worksPage + 1;
      const res = await worksApi.getAll({
        title: searchTitle || undefined,
        workType: selectedType || undefined,
        genreId: selectedGenreId || undefined,
        readingStatus: selectedStatus || undefined,
        page: nextPage,
        pageSize: 20,
      });

      setWorks((prev) => [...prev, ...res.items]);
      setWorksPage(nextPage);
      setHasMoreWorks(nextPage < res.totalPages);
    } catch (err) {
      console.error('Erro ao carregar mais obras:', err);
    } finally {
      setLoadingMoreWorks(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchWorks();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (fetchWorksAbortControllerRef.current) {
        fetchWorksAbortControllerRef.current.abort();
      }
    };
  }, [searchTitle, selectedStatus, selectedType, selectedGenreId, isAuthenticated]);

  const fetchWorkDetails = async (workId: string) => {
    setLoadingDetails(true);
    try {
      const existingInWorks = works.find((w) => w.id === workId);
      const needWorkFetch = !existingInWorks;
      const [progRes, charRes, attRes, fetchedWork] = await Promise.all([
        progressApi.getByWorkId(workId),
        charactersApi.getByWorkId(workId),
        attachmentsApi.getByWorkId(workId),
        needWorkFetch ? worksApi.getById(workId).catch(() => null) : Promise.resolve(null),
      ]);
      const targetWork = fetchedWork || existingInWorks;
      if (targetWork) {
        setCurrentWork(targetWork);
        if (fetchedWork) {
          setWorks((prev) => (prev.some((w) => w.id === fetchedWork.id) ? prev : [fetchedWork, ...prev]));
        }
      }
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
      setCurrentWork(null);
      setProgressList([]);
      setCharacters([]);
      setAttachments([]);
    }
  }, [selectedWorkId]);

  const selectedWork =
    (currentWork && currentWork.id === selectedWorkId)
      ? currentWork
      : works.find((w) => w.id === selectedWorkId);

  const handleWorkDeleted = () => {
    setSelectedWorkId(null);
    selectedWorkIdRef.current = null;
    setCurrentWork(null);
    updateNavParams({ workId: null });
    setMobileView('list');
    fetchWorks();
  };

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

  if (authLoading) {
    return (
      <>
        <ColdStartOverlay />
        <div style={{ display: 'flex', height: '100dvh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#8b5cf6', fontSize: '1.1rem', fontWeight: 600 }}>
          Carregando NovelReader...
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <ColdStartOverlay />
        <LoginPage />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
      <ColdStartOverlay />
      {/* Sidebar com Lista e Filtros */}
      <div style={{ display: !isMobile || mobileView === 'list' ? 'flex' : 'none', width: isMobile ? '100%' : 'auto', height: '100%' }}>
        <Sidebar
          works={works}
          loading={loading}
          selectedWorkId={selectedWorkId}
          onSelectWork={handleSelectWork}
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
          isMobile={isMobile}
          onLoadMore={fetchMoreWorks}
          hasMore={hasMoreWorks}
          loadingMore={loadingMoreWorks}
        />
      </div>

      {/* Painel Principal */}
      <main style={{ flex: 1, display: !isMobile || mobileView === 'detail' ? 'flex' : 'none', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
        {loading && works.length === 0 && !selectedWork ? (
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
            onWorkDeleted={handleWorkDeleted}
            onOpenEditWork={handleOpenEditWork}
            onBackToLibrary={isMobile ? handleBackToLibrary : undefined}
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
