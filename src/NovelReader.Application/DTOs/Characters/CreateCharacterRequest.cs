using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Characters
{
    public record CreateCharacterRequest(
        Guid WorkId,
        string Name,
        string? Description,
        string? ImageUrl,
        CharacterType CharacterType,
        WorkChapterDto FirstAppearance
    );
}
