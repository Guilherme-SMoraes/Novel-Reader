using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Persistence.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }

        public async Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.GoogleId == googleId, cancellationToken);
        }

        public async Task<bool> HasAnyUserAsync(CancellationToken cancellationToken)
        {
            return await _context.Users
                .AnyAsync(cancellationToken);
        }

        public async Task CreateAsync(User user, CancellationToken cancellationToken)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(User user, CancellationToken cancellationToken)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task ClaimOrphanWorksAsync(Guid userId, CancellationToken cancellationToken)
        {
            await _context.Works
                .IgnoreQueryFilters()
                .Where(w => w.UserId == null)
                .ExecuteUpdateAsync(s => s.SetProperty(w => w.UserId, userId), cancellationToken);
        }
    }
}
