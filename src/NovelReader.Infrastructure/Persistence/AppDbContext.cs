using Microsoft.EntityFrameworkCore;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        private readonly ICurrentUserService? _currentUserService;

        public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService? currentUserService = null) : base(options)
        {
            _currentUserService = currentUserService;
        }

        public Guid? CurrentUserId => _currentUserService?.UserId;

        public DbSet<User> Users { get; set; }
        public DbSet<WhitelistEntry> WhitelistEntries { get; set; }
        public DbSet<Work> Works { get; set; }
        public DbSet<WorkFormat> WorkFormats { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Character> Characters { get; set; }
        public DbSet<CharacterAppearance> CharacterAppearances { get; set; }
        public DbSet<Progress> Progresses { get; set; }
        public DbSet<Attachment> Attachments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            modelBuilder.Entity<Work>().HasQueryFilter(w => CurrentUserId == null || w.UserId == CurrentUserId);
        }
    }
}
