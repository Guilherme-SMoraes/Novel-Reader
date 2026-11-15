using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface IWorkRepository
    {
        Task CreateAsync(Work work, CancellationToken cancellationToken);
        Task<Work?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<PagedResult<Work>> FindByNameAsync(string name, int page, int pageSize, CancellationToken cancellationToken);
        Task<PagedResult<Work>> ListByGenreAsync(Guid genreId, int page, int pageSize, CancellationToken cancellationToken);
        Task<PagedResult<Work>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken);
        Task<PagedResult<Work>> GetAllAsync(string? title, WorkType? workType, Guid? genreId, ReadingStatus? readingStatus, int page, int pageSize, CancellationToken cancellationToken);
        Task UpdateAsync(Work work, CancellationToken cancellationToken);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken);
        Task AddGenreAsync(Guid workId, Guid genreId, CancellationToken cancellationToken);
        Task RemoveGenreAsync(Guid workId, Guid genreId, CancellationToken cancellationToken);
    }
}
