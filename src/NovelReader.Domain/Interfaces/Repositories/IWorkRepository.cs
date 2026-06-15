using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface IWorkRepository
    {
        Task CreateAsync(Work work, CancellationToken cancellationToken);
        Task<Work?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<PagedResult<Work>> FindByNameAsync(string name, int page, int pageSize, CancellationToken cancellationToken);
        Task<PagedResult<Work>> ListByGenreAsync(Guid genreId, int page, int pageSize, CancellationToken cancellationToken);
        Task<PagedResult<Work>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken);
        Task UpdateAsync(Work work, CancellationToken cancellationToken);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    }
}