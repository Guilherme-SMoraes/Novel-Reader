using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class WorkFormatConfiguration : IEntityTypeConfiguration<WorkFormat>
    {
        public void Configure(EntityTypeBuilder<WorkFormat> builder)
        {
            builder.ToTable("WorkFormats");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.WorkType).IsRequired();
            builder.Property(x => x.LinkWhereToRead).HasMaxLength(2048);

            builder.OwnsOne(x => x.TotalChapter, tc =>
            {
                tc.Property(w => w.Volume).HasColumnName("TotalVolume");
                tc.Property(w => w.Chapter).HasColumnName("TotalChapter");
            });

            builder.OwnsOne(x => x.TranslatedUpTo, tu =>
            {
                tu.Property(w => w.Volume).HasColumnName("TranslatedVolume");
                tu.Property(w => w.Chapter).HasColumnName("TranslatedChapter");
            });
            builder.Navigation(x => x.TranslatedUpTo).IsRequired(false);

            builder.HasIndex(x => new { x.WorkId, x.WorkType }).IsUnique();
        }
    }
}
