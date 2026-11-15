using NovelReader.Application.DTOs.Progress;
using NovelReader.Domain.Common;

namespace NovelReader.Application.Interfaces
{
    public interface IProgressService
    {
        Task<ProgressResponse> CreateAsync(CreateProgressRequest request, CancellationToken cancellationToken = default);
        Task<PagedResult<ProgressResponse>> GetByWorkIdAsync(Guid workId, int page, int pageSize, CancellationToken cancellationToken = default);
        Task<ProgressResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task UpdateDescriptionAsync(Guid id, UpdateProgressDescriptionRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
