using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Works
{
    public record WorkResponse(
        Guid Id,
        string Title,
        string? Description,
        WorkType WorkType,
        string AggregatorLink,
        string? LinkWhereToRead,
        string? CoverImageUrl,
        WorkChapterDto TotalChapter,
        WorkChapterDto? TranslatedUpTo,
        bool? IsFullyTranslated,
        Language OriginalLanguage,
        Language? TranslatedLanguage
    )
    {
        public static WorkResponse FromEntity(Work work) =>
            new(
                work.Id,
                work.Title,
                work.Description,
                work.WorkType,
                work.AggregatorLink,
                work.LinkWhereToRead,
                work.CoverImageUrl,
                new WorkChapterDto(work.TotalChapter.Volume, work.TotalChapter.Chapter),
                work.TranslatedUpTo != null ? new WorkChapterDto(work.TranslatedUpTo.Volume, work.TranslatedUpTo.Chapter) : null,
                work.IsFullyTranslated,
                work.OriginalLanguage,
                work.TranslatedLanguage
            );
    }
}
