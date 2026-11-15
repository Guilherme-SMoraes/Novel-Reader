using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Works
{
    public record UpdateWorkFormatRequest(
        WorkType WorkType,
        WorkChapterDto TotalChapter,
        WorkChapterDto? TranslatedUpTo = null,
        Language? TranslatedLanguage = null,
        string? LinkWhereToRead = null
    );
}
