using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class WhitelistEntryConfiguration : IEntityTypeConfiguration<WhitelistEntry>
    {
        public void Configure(EntityTypeBuilder<WhitelistEntry> builder)
        {
            builder.ToTable("WhitelistEntries");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Email)
                   .IsRequired()
                   .HasMaxLength(256);

            builder.HasIndex(x => x.Email)
                   .IsUnique();

            builder.Property(x => x.CreatedBy)
                   .IsRequired()
                   .HasMaxLength(256);

            builder.Property(x => x.Description)
                   .HasMaxLength(500);

            builder.Property(x => x.CreatedAt)
                   .IsRequired();
        }
    }
}
