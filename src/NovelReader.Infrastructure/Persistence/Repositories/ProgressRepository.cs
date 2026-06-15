using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Persistence.Repositories
{
    public class ProgressRepository : IProgressRepository
    {
        private readonly AppDbContext _context;

        public ProgressRepository(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }
        public async Task CreateAsync(Progress progress, CancellationToken cancellationToken)
        {
            _context.Progresses.Add(progress);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _context.Progresses
                .Where(x => x.Id == id)
                .ExecuteDeleteAsync(cancellationToken);

            if(deleted == 0)
            {
                throw new KeyNotFoundException($"Progress {id} não encontrado");
            }
        }

        public async Task<Progress?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Progresses
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<PagedResult<Progress>> GetByWorkIdAsync(Guid workId, int page, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Progresses
                .AsNoTracking()
                .Where(x => x.WorkId == workId)
                .OrderByDescending(x => x.StoppedAt);
            
            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<Progress>(items, total, page, pageSize);
        }

        public async Task UpdateDescriptionAsync(Guid id, string? description, CancellationToken cancellationToken)
        {
            var updated = await _context.Progresses
                .Where(x => x.Id == id)
                .ExecuteUpdateAsync(x => x.SetProperty(w => w.ReadingDescription, description), cancellationToken);

            if(updated == 0)
            {
                throw new KeyNotFoundException($"Progress {id} não encontrado");
            }
        }
    }
}