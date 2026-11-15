using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class ProgressConfiguration : IEntityTypeConfiguration<Progress>
    {
        public void Configure(EntityTypeBuilder<Progress> builder)
        {
            builder.ToTable("Progresses");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.WorkType).IsRequired();
            builder.Property(x => x.ReadingDescription)
                .HasColumnType("text");

            builder.OwnsOne(x => x.StoppedAtChapter, sc =>
            {
               sc.Property(w => w.Volume).HasColumnName("StoppedVolume");
               sc.Property(w => w.Chapter).HasColumnName("StoppedChapter");
            });

            builder.HasIndex(x => new { x.WorkId, x.WorkType });
        }
    }
}
