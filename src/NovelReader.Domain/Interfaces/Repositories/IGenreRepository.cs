using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface IGenreRepository
    {
        Task CreateAsync(Genre genre, CancellationToken cancellationToken);
        Task UpdateAsync(Genre genre, CancellationToken cancellationToken);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken);
        Task<PagedResult<Genre>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken);
        Task<Genre?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    }
}