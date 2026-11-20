namespace NovelReader.Domain.Entities
{
    public class WhitelistEntry
    {
        public Guid Id { get; init; }
        public string Email { get; private set; }
        public string? Description { get; private set; }
        public DateTime CreatedAt { get; init; }
        public string CreatedBy { get; private set; }

#pragma warning disable CS8618
        private WhitelistEntry() { }
#pragma warning restore CS8618

        public WhitelistEntry(string email, string createdBy, string? description = null)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Email não pode ser vazio.");
            }

            Id = Guid.NewGuid();
            Email = email.Trim().ToLowerInvariant();
            CreatedAt = DateTime.UtcNow;
            CreatedBy = string.IsNullOrWhiteSpace(createdBy) ? "System" : createdBy.Trim();
            Description = description?.Trim();
        }

        public void UpdateDescription(string? description)
        {
            Description = description?.Trim();
        }
    }
}
