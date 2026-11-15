using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Works
{
    public record WorkFormatDto(
        Guid Id,
        Guid WorkId,
        WorkType WorkType,
        WorkChapterDto TotalChapter,
        WorkChapterDto? TranslatedUpTo,
        bool? IsFullyTranslated,
        Language? TranslatedLanguage,
        string? LinkWhereToRead
    )
    {
        public static WorkFormatDto FromEntity(WorkFormat format) =>
            new(
                format.Id,
                format.WorkId,
                format.WorkType,
                new WorkChapterDto(format.TotalChapter.Volume, format.TotalChapter.Chapter),
                format.TranslatedUpTo != null ? new WorkChapterDto(format.TranslatedUpTo.Volume, format.TranslatedUpTo.Chapter) : null,
                format.IsFullyTranslated,
                format.TranslatedLanguage,
                format.LinkWhereToRead
            );
    }
}
