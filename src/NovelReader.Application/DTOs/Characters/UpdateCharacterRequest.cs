using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Characters
{
    public record UpdateCharacterRequest(
        string Name,
        string? Description,
        string? ImageUrl,
        CharacterType CharacterType,
        List<CharacterAppearanceDto> FirstAppearances,
        List<string>? AlternativeNames = null,
        List<string>? Affiliations = null
    );
}
