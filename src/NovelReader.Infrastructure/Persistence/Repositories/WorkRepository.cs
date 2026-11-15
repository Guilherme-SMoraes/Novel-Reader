using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Persistence.Repositories
{
    public class WorkRepository : IWorkRepository
    {
        private readonly AppDbContext _context;

        public WorkRepository(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }

        public async Task CreateAsync(Work work, CancellationToken cancellationToken)
        {
            _context.Works.Add(work);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _context.Works
                .Where(x => x.Id == id)
                .ExecuteDeleteAsync(cancellationToken);

            if(deleted == 0)
            {
                throw new KeyNotFoundException($"Work {id} não encontrado");
            }
        }

        public async Task<PagedResult<Work>> FindByNameAsync(string name, int page, int pageSize, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return new PagedResult<Work>([], 0, page, pageSize);
            }
            
            var query = _context.Works
                .AsNoTracking()
                .Include(x => x.Genres)
                .Where(x => EF.Functions.ILike(x.Title,$"%{name}%"));

            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
            
            return new PagedResult<Work>(items, total, page, pageSize);
        }

        public async Task<PagedResult<Work>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken)
        {
            return await GetAllAsync(null, null, null, null, page, pageSize, cancellationToken);
        }

        public async Task<PagedResult<Work>> GetAllAsync(
            string? title,
            WorkType? workType,
            Guid? genreId,
            ReadingStatus? readingStatus,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            var query = _context.Works
                .AsNoTracking()
                .Include(x => x.Genres)
                .Include(x => x.Progresses)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(title))
            {
                query = query.Where(x => EF.Functions.ILike(x.Title, $"%{title}%"));
            }

            if (workType.HasValue)
            {
                query = query.Where(x => x.WorkType == workType.Value);
            }

            if (genreId.HasValue)
            {
                query = query.Where(x => x.Genres.Any(g => g.Id == genreId.Value));
            }

            if (readingStatus.HasValue)
            {
                query = query.Where(x => x.Progresses.OrderByDescending(p => p.StoppedAt).Select(p => p.ReadingStatus).FirstOrDefault() == readingStatus.Value);
            }

            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(x => x.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<Work>(items, total, page, pageSize);
        }

        public async Task<Work?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Works
                .AsNoTracking()
                .AsSplitQuery()
                .Include(x => x.Genres)
                .Include(x => x.Characters)
                .Include(x => x.Progresses)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<PagedResult<Work>> ListByGenreAsync(Guid genreId, int page, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Works
                .AsNoTracking()
                .Include(x => x.Genres)
                .Where(x => x.Genres.Any(w => w.Id == genreId));

            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<Work>(items, total, page, pageSize);
        }

        public async Task UpdateAsync(Work work, CancellationToken cancellationToken)
        {
            var updated = await _context.Works
                .Where(x => x.Id == work.Id)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(w => w.Title, work.Title)
                    .SetProperty(w => w.Description, work.Description)
                    .SetProperty(w => w.AggregatorLink, work.AggregatorLink)
                    .SetProperty(w => w.LinkWhereToRead, work.LinkWhereToRead)
                    .SetProperty(w => w.CoverImageUrl, work.CoverImageUrl)
                    .SetProperty(w => w.TotalChapter.Volume, work.TotalChapter.Volume)
                    .SetProperty(w => w.TotalChapter.Chapter, work.TotalChapter.Chapter)
                    .SetProperty(w => w.TranslatedUpTo!.Volume, work.TranslatedUpTo?.Volume)
                    .SetProperty(w => w.TranslatedUpTo!.Chapter, work.TranslatedUpTo?.Chapter)
                    .SetProperty(w => w.TranslatedLanguage, work.TranslatedLanguage), 
                    cancellationToken);

            if(updated == 0)
            {
                throw new KeyNotFoundException($"Work {work.Id} não encontrado");
            }
        }

        public async Task AddGenreAsync(Guid workId, Guid genreId, CancellationToken cancellationToken)
        {
            var work = await _context.Works
                .Include(x => x.Genres)
                .FirstOrDefaultAsync(x => x.Id == workId, cancellationToken);

            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {workId} não encontrada.");
            }

            var genre = await _context.Genres.FirstOrDefaultAsync(x => x.Id == genreId, cancellationToken);
            if (genre is null)
            {
                throw new KeyNotFoundException($"Gênero com ID {genreId} não encontrado.");
            }

            work.AddGenre(genre);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task RemoveGenreAsync(Guid workId, Guid genreId, CancellationToken cancellationToken)
        {
            var work = await _context.Works
                .Include(x => x.Genres)
                .FirstOrDefaultAsync(x => x.Id == workId, cancellationToken);

            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {workId} não encontrada.");
            }

            work.RemoveGenre(genreId);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task SetGenresAsync(Guid workId, IEnumerable<Guid> genreIds, CancellationToken cancellationToken)
        {
            var work = await _context.Works
                .Include(x => x.Genres)
                .FirstOrDefaultAsync(x => x.Id == workId, cancellationToken);

            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {workId} não encontrada.");
            }

            var targetIds = genreIds.ToHashSet();
            work.Genres.RemoveAll(g => !targetIds.Contains(g.Id));

            var currentIds = work.Genres.Select(g => g.Id).ToHashSet();
            var idsToAdd = targetIds.Where(id => !currentIds.Contains(id)).ToList();

            if (idsToAdd.Any())
            {
                var genresToAdd = await _context.Genres
                    .Where(g => idsToAdd.Contains(g.Id))
                    .ToListAsync(cancellationToken);

                foreach (var genre in genresToAdd)
                {
                    work.AddGenre(genre);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}