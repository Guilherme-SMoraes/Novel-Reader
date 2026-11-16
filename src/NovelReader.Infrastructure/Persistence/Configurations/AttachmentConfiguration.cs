using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
    {
        public void Configure(EntityTypeBuilder<Attachment> builder)
        {
            builder.ToTable("Attachments");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(x => x.Category)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(x => x.Content)
                   .HasColumnType("text");

            builder.Property(x => x.ImageUrl)
                   .HasMaxLength(2048);

            builder.Property(x => x.CreatedAt)
                   .IsRequired();

            builder.Property(x => x.UpdatedAt);

            builder.HasIndex(x => new { x.WorkId, x.CreatedAt });
        }
    }
}
