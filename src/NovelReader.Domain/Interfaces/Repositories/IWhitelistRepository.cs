using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface IWhitelistRepository
    {
        Task<bool> IsEmailAllowedAsync(string email, CancellationToken cancellationToken);
        Task<IReadOnlyList<WhitelistEntry>> GetAllAsync(CancellationToken cancellationToken);
        Task<WhitelistEntry?> GetByEmailAsync(string email, CancellationToken cancellationToken);
        Task<WhitelistEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task CreateAsync(WhitelistEntry entry, CancellationToken cancellationToken);
        Task DeleteAsync(WhitelistEntry entry, CancellationToken cancellationToken);
    }
}
