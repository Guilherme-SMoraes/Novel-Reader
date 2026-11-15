namespace NovelReader.Application.DTOs.Attachments
{
    public class CreateAttachmentRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
    }
}
