using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

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
        }
    }
}
