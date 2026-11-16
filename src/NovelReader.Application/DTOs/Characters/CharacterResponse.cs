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
        List<CharacterAppearanceDto> FirstAppearances,
        List<string> AlternativeNames,
        List<string> Affiliations
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
                character.FirstAppearances?.Select(CharacterAppearanceDto.FromEntity).ToList() ?? new List<CharacterAppearanceDto>(),
                character.AlternativeNames ?? new List<string>(),
                character.Affiliations ?? new List<string>()
            );
    }
}
