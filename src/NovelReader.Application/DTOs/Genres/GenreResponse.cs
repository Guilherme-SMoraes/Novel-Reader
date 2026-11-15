using NovelReader.Domain.Entities;

namespace NovelReader.Application.DTOs.Genres
{
    public record GenreResponse(Guid Id, string Name, string? Description)
    {
        public static GenreResponse FromEntity(Genre genre) =>
            new(genre.Id, genre.Name, genre.Description);
    }
}
