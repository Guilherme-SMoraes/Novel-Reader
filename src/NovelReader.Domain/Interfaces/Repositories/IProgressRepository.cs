using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface IProgressRepository
    {
        Task CreateAsync(Progress progress, CancellationToken cancellationToken);
        Task UpdateDescriptionAsync(Guid id, string? description, CancellationToken cancellationToken);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken);
        Task<PagedResult<Progress>> GetByWorkIdAsync(Guid workId, WorkType? workType, int page, int pageSize, CancellationToken cancellationToken);
        Task<Progress?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    }
}
