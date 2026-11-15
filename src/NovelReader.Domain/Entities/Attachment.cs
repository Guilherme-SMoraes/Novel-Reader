namespace NovelReader.Domain.Entities
{
    public class Attachment
    {
        public Guid Id { get; init; }
        public Guid WorkId { get; init; }
        public string Title { get; private set; }
        public string Category { get; private set; }
        public string? Content { get; private set; }
        public string? ImageUrl { get; private set; }
        public DateTime CreatedAt { get; init; }
        public DateTime? UpdatedAt { get; private set; }

#pragma warning disable CS8618
        private Attachment() { }
#pragma warning restore CS8618

        public Attachment(string title, string category, Guid workId, string? content = null, string? imageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                throw new ArgumentException("O título do anexo não pode ser vazio.");
            }
            if (string.IsNullOrWhiteSpace(category))
            {
                throw new ArgumentException("A categoria do anexo não pode ser vazia.");
            }
            if (workId == Guid.Empty)
            {
                throw new ArgumentException("WorkId inválido.");
            }

            Id = Guid.NewGuid();
            WorkId = workId;
            Title = title.Trim();
            Category = category.Trim();
            Content = content?.Trim();
            ImageUrl = imageUrl?.Trim();
            CreatedAt = DateTime.UtcNow;
        }

        public void Update(string title, string category, string? content, string? imageUrl)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                throw new ArgumentException("O título do anexo não pode ser vazio.");
            }
            if (string.IsNullOrWhiteSpace(category))
            {
                throw new ArgumentException("A categoria do anexo não pode ser vazia.");
            }

            Title = title.Trim();
            Category = category.Trim();
            Content = content?.Trim();
            ImageUrl = imageUrl?.Trim();
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
