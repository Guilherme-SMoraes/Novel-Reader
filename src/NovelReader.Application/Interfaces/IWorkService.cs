using NovelReader.Application.DTOs.Works;
using NovelReader.Domain.Common;

namespace NovelReader.Application.Interfaces
{
    public interface IWorkService
    {
        Task<WorkResponse> CreateAsync(CreateWorkRequest request, CancellationToken cancellationToken = default);
        Task<WorkResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<PagedResult<WorkResponse>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default);
        Task UpdateAsync(Guid id, UpdateWorkRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<PagedResult<WorkResponse>> FindByNameAsync(string name, int page, int pageSize, CancellationToken cancellationToken = default);
        Task<PagedResult<WorkResponse>> ListByGenreAsync(Guid genreId, int page, int pageSize, CancellationToken cancellationToken = default);
    }
}
