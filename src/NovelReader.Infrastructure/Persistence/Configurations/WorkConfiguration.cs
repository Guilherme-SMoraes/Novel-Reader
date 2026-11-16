using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class WorkConfiguration : IEntityTypeConfiguration<Work>
    {
        public void Configure(EntityTypeBuilder<Work> builder)
        {
            builder.ToTable("Works");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Title)
                    .IsRequired()
                    .HasMaxLength(200);
            builder.Property(x => x.Description)
                    .HasMaxLength(1500);
            builder.Property(x => x.AggregatorLink)
                    .IsRequired()
                    .HasMaxLength(2048);
            builder.Property(x => x.CoverImageUrl)
                    .HasMaxLength(2048);
            builder.Property(x => x.AlternativeTitles);

            builder.HasMany(x => x.Formats)
                    .WithOne()
                    .HasForeignKey(x => x.WorkId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Characters)
                    .WithOne()
                    .HasForeignKey(x => x.WorkId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Progresses)
                    .WithOne()
                    .HasForeignKey(x => x.WorkId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Attachments)
                    .WithOne()
                    .HasForeignKey(x => x.WorkId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Genres)
                    .WithMany()
                    .UsingEntity("WorkGenres");
        }
    }
}
