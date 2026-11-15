using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface IAttachmentRepository
    {
        Task<Attachment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Attachment>> GetByWorkIdAsync(Guid workId, CancellationToken cancellationToken = default);
        Task AddAsync(Attachment attachment, CancellationToken cancellationToken = default);
        Task UpdateAsync(Attachment attachment, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
