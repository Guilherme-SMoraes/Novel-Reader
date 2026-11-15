using NovelReader.Application.DTOs.Attachments;

namespace NovelReader.Application.Interfaces
{
    public interface IAttachmentService
    {
        Task<AttachmentResponse> CreateAsync(Guid workId, CreateAttachmentRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<AttachmentResponse>> GetByWorkIdAsync(Guid workId, CancellationToken cancellationToken = default);
        Task<AttachmentResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<AttachmentResponse> UpdateAsync(Guid id, UpdateAttachmentRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
