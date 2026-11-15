using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NovelReader.Application.Interfaces;
using NovelReader.Application.Services;

namespace NovelReader.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

            services.AddScoped<IWorkService, WorkService>();
            services.AddScoped<IProgressService, ProgressService>();
            services.AddScoped<ICharacterService, CharacterService>();
            services.AddScoped<IGenreService, GenreService>();
            services.AddScoped<IAttachmentService, AttachmentService>();

            return services;
        }
    }
}
