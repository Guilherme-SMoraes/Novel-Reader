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
            builder.Property(x => x.ImageUrl)
                .HasMaxLength(2048);
            builder.Property(x => x.AlternativeNames);
            builder.Property(x => x.Affiliations)
                .HasDefaultValueSql("'{}'");

            builder.HasMany(x => x.FirstAppearances)
                .WithOne()
                .HasForeignKey(x => x.CharacterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.WorkId, x.CharacterType, x.Name });
        }
    }
}
