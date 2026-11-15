using NovelReader.Domain.Entities;

namespace NovelReader.Application.DTOs.Attachments
{
    public class AttachmentResponse
    {
        public Guid Id { get; set; }
        public Guid WorkId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public static AttachmentResponse FromEntity(Attachment entity) => new()
        {
            Id = entity.Id,
            WorkId = entity.WorkId,
            Title = entity.Title,
            Category = entity.Category,
            Content = entity.Content,
            ImageUrl = entity.ImageUrl,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
