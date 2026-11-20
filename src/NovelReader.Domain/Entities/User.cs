namespace NovelReader.Domain.Entities
{
    public class User
    {
        public const string AdminEmail = "guisanmo1@gmail.com";

        public Guid Id { get; init; }
        public string GoogleId { get; private set; }
        public string Email { get; private set; }
        public string Name { get; private set; }
        public string? AvatarUrl { get; private set; }
        public string Role { get; private set; }
        public DateTime CreatedAt { get; init; }

#pragma warning disable CS8618
        private User() { }
#pragma warning restore CS8618

        public User(string googleId, string email, string name, string? avatarUrl = null, string? role = null)
        {
            if (string.IsNullOrWhiteSpace(googleId))
            {
                throw new ArgumentException("GoogleId não pode ser vazio.");
            }
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Email não pode ser vazio.");
            }
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Nome não pode ser vazio.");
            }

            Id = Guid.NewGuid();
            GoogleId = googleId.Trim();
            Email = email.Trim().ToLowerInvariant();
            Name = name.Trim();
            AvatarUrl = avatarUrl?.Trim();
            CreatedAt = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(role))
            {
                Role = role.Trim();
            }
            else
            {
                Role = Email.Equals(AdminEmail, StringComparison.OrdinalIgnoreCase) ? "Admin" : "User";
            }
        }

        public void UpdateProfile(string name, string? avatarUrl)
        {
            if (!string.IsNullOrWhiteSpace(name))
            {
                Name = name.Trim();
            }
            AvatarUrl = avatarUrl?.Trim();

            if (Email.Equals(AdminEmail, StringComparison.OrdinalIgnoreCase) && Role != "Admin")
            {
                Role = "Admin";
            }
        }

        public void SetRole(string role)
        {
            if (!string.IsNullOrWhiteSpace(role))
            {
                Role = role.Trim();
            }
        }
    }
}
