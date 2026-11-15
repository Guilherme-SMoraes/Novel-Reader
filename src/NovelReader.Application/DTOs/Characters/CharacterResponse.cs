using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Characters
{
    public record CharacterResponse(
        Guid Id,
        Guid WorkId,
        string Name,
        string? Description,
        string? ImageUrl,
        CharacterType CharacterType,
        WorkChapterDto FirstAppearance
    )
    {
        public static CharacterResponse FromEntity(Character character) =>
            new(
                character.Id,
                character.WorkId,
                character.Name,
                character.Description,
                character.ImageUrl,
                character.CharacterType,
                new WorkChapterDto(character.FirstAppearance.Volume, character.FirstAppearance.Chapter)
            );
    }
}
