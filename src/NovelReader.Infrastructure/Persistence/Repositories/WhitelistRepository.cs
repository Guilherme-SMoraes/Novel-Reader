using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Persistence.Repositories
{
    public class WhitelistRepository : IWhitelistRepository
    {
        private readonly AppDbContext _context;

        public WhitelistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsEmailAllowedAsync(string email, CancellationToken cancellationToken)
        {
            var normalized = email.Trim().ToLowerInvariant();
            return await _context.WhitelistEntries
                .AsNoTracking()
                .AnyAsync(w => w.Email == normalized, cancellationToken);
        }

        public async Task<IReadOnlyList<WhitelistEntry>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await _context.WhitelistEntries
                .AsNoTracking()
                .OrderBy(w => w.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<WhitelistEntry?> GetByEmailAsync(string email, CancellationToken cancellationToken)
        {
            var normalized = email.Trim().ToLowerInvariant();
            return await _context.WhitelistEntries
                .FirstOrDefaultAsync(w => w.Email == normalized, cancellationToken);
        }

        public async Task<WhitelistEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.WhitelistEntries
                .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        }

        public async Task CreateAsync(WhitelistEntry entry, CancellationToken cancellationToken)
        {
            _context.WhitelistEntries.Add(entry);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(WhitelistEntry entry, CancellationToken cancellationToken)
        {
            _context.WhitelistEntries.Remove(entry);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
