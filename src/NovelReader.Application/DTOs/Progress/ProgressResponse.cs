using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Progress
{
    public record ProgressResponse(
        Guid Id,
        Guid WorkId,
        WorkType WorkType,
        WorkChapterDto StoppedAtChapter,
        ReadingStatus ReadingStatus,
        string? ReadingDescription,
        string? ChapterLink,
        DateTime StoppedAt
    )
    {
        public static ProgressResponse FromEntity(Domain.Entities.Progress progress) =>
            new(
                progress.Id,
                progress.WorkId,
                progress.WorkType,
                new WorkChapterDto(progress.StoppedAtChapter.Volume, progress.StoppedAtChapter.Chapter),
                progress.ReadingStatus,
                progress.ReadingDescription,
                progress.ChapterLink,
                progress.StoppedAt
            );
    }
}
