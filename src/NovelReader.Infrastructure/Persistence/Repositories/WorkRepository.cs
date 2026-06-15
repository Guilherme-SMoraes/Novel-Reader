using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
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
            var query =  _context.Works
                .AsNoTracking()
                .Include(x => x.Genres);
            
            var total = await query.CountAsync(cancellationToken);

            var items = await query
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
                    .SetProperty(w => w.TotalChapter.Volume, work.TotalChapter.Volume)
                    .SetProperty(w => w.TotalChapter.Chapter, work.TotalChapter.Chapter)
                    .SetProperty(w => w.TranslatedUpTo.Volume, work.TranslatedUpTo?.Volume)
                    .SetProperty(w => w.TranslatedUpTo.Chapter, work.TranslatedUpTo?.Chapter)
                    .SetProperty(w => w.TranslatedLanguage, work.TranslatedLanguage), 
                    cancellationToken);

            if(updated == 0)
            {
                throw new KeyNotFoundException($"Work {work.Id} não encontrado");
            }
        }
    }
}