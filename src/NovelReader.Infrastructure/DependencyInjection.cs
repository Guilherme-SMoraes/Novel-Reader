using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NovelReader.Domain.Interfaces.Repositories;
using NovelReader.Infrastructure.Persistence;
using NovelReader.Infrastructure.Persistence.Repositories;

namespace NovelReader.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options => 
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IWorkRepository, WorkRepository>();
            services.AddScoped<IGenreRepository, GenreRepository>();
            services.AddScoped<IProgressRepository, ProgressRepository>();
            services.AddScoped<ICharacterRepository, CharacterRepository>();
            services.AddScoped<IAttachmentRepository, AttachmentRepository>();

            return services;
        }
    }
}