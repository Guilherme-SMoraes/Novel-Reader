using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Works
{
    public record CreateWorkRequest(
        string Title,
        string? Description,
        WorkType WorkType,
        string AggregatorLink,
        string? LinkWhereToRead,
        string? CoverImageUrl,
        WorkChapterDto TotalChapter,
        Language OriginalLanguage,
        List<Guid>? GenreIds = null
    );
}
