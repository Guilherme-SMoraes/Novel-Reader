using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Works
{
    public record UpdateWorkRequest(
        string Title,
        string? Description,
        string AggregatorLink,
        string? LinkWhereToRead,
        string? CoverImageUrl,
        WorkChapterDto TotalChapter,
        WorkChapterDto? TranslatedUpTo,
        Language? TranslatedLanguage,
        List<Guid>? GenreIds = null
    );
}
