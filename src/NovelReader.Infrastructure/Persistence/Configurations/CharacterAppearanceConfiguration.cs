using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class CharacterAppearanceConfiguration : IEntityTypeConfiguration<CharacterAppearance>
    {
        public void Configure(EntityTypeBuilder<CharacterAppearance> builder)
        {
            builder.ToTable("CharacterAppearances");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.WorkType).IsRequired();

            builder.OwnsOne(x => x.Chapter, c =>
            {
                c.Property(w => w.Volume).HasColumnName("AppearanceVolume");
                c.Property(w => w.Chapter).HasColumnName("AppearanceChapter").IsRequired();
            });

            builder.HasIndex(x => new { x.CharacterId, x.WorkType }).IsUnique();
        }
    }
}
