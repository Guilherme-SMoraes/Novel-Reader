using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Characters
{
    public record UpdateCharacterRequest(
        string Name,
        string? Description,
        CharacterType CharacterType
    );
}
