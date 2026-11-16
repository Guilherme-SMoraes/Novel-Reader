using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Progress
{
    public record CreateProgressRequest(
        Guid WorkId,
        WorkType WorkType,
        WorkChapterDto StoppedAtChapter,
        ReadingStatus ReadingStatus,
        string? ReadingDescription,
        string? ChapterLink = null
    );
}
