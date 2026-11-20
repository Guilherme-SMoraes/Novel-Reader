using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Interfaces.Repositories;
using NovelReader.Infrastructure.Persistence;
using NovelReader.Infrastructure.Persistence.Repositories;
using NovelReader.Infrastructure.Services;

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
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IWhitelistRepository, WhitelistRepository>();
            services.AddScoped<IGenreRepository, GenreRepository>();
            services.AddScoped<IProgressRepository, ProgressRepository>();
            services.AddScoped<ICharacterRepository, CharacterRepository>();
            services.AddScoped<IAttachmentRepository, AttachmentRepository>();
            services.AddScoped<IAuthService, AuthService>();

            services.AddHttpClient<IImageUploadService, ImgBbUploadService>();

            return services;
        }
    }
}
