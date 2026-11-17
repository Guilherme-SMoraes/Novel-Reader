using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken);
        Task<bool> HasAnyUserAsync(CancellationToken cancellationToken);
        Task CreateAsync(User user, CancellationToken cancellationToken);
        Task UpdateAsync(User user, CancellationToken cancellationToken);
        Task ClaimOrphanWorksAsync(Guid userId, CancellationToken cancellationToken);
    }
}
