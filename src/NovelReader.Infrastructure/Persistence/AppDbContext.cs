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

            modelBuilder.HasPostgresExtension("pg_trgm");

            modelBuilder.Entity<Work>().HasQueryFilter(w => CurrentUserId == null || w.UserId == CurrentUserId);
            modelBuilder.Entity<WorkFormat>().HasQueryFilter(wf => CurrentUserId == null || Works.Any(w => w.Id == wf.WorkId));
            modelBuilder.Entity<Character>().HasQueryFilter(c => CurrentUserId == null || Works.Any(w => w.Id == c.WorkId));
            modelBuilder.Entity<CharacterAppearance>().HasQueryFilter(ca => CurrentUserId == null || Characters.Any(c => c.Id == ca.CharacterId));
            modelBuilder.Entity<Progress>().HasQueryFilter(p => CurrentUserId == null || Works.Any(w => w.Id == p.WorkId));
            modelBuilder.Entity<Attachment>().HasQueryFilter(a => CurrentUserId == null || Works.Any(w => w.Id == a.WorkId));
        }
    }
}
