using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class CharacterConfiguration : IEntityTypeConfiguration<Character>
    {
        public void Configure(EntityTypeBuilder<Character> builder)
        {
            builder.ToTable("Characters");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(x => x.Description)
                .HasMaxLength(2500);
            
            builder.OwnsOne(x => x.FirstAppearance, fa =>
            {
                fa.Property(w => w.Volume).HasColumnName("AppearanceVolume");
                fa.Property(w => w.Chapter).HasColumnName("AppearanceChapter");
            });
        }
    }
}