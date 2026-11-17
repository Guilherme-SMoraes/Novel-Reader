using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NovelReader.Domain.Entities;

namespace NovelReader.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.GoogleId)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasIndex(x => x.GoogleId)
                   .IsUnique();

            builder.Property(x => x.Email)
                   .IsRequired()
                   .HasMaxLength(256);

            builder.HasIndex(x => x.Email);

            builder.Property(x => x.Name)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(x => x.AvatarUrl)
                   .HasMaxLength(2048);

            builder.Property(x => x.CreatedAt)
                   .IsRequired();
        }
    }
}
