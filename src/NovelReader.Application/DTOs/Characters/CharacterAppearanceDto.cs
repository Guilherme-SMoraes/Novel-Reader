using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Characters
{
    public record CharacterAppearanceDto(
        WorkType WorkType,
        WorkChapterDto Chapter
    )
    {
        public static CharacterAppearanceDto FromEntity(CharacterAppearance appearance) =>
            new(appearance.WorkType, new WorkChapterDto(appearance.Chapter.Volume, appearance.Chapter.Chapter));
    }
}
