using NovelReader.Application.DTOs.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Progress
{
    public record ProgressResponse(
        Guid Id,
        Guid WorkId,
        WorkChapterDto StoppedAtChapter,
        ReadingStatus ReadingStatus,
        string? ReadingDescription,
        DateTime StoppedAt
    )
    {
        public static ProgressResponse FromEntity(Domain.Entities.Progress progress) =>
            new(
                progress.Id,
                progress.WorkId,
                new WorkChapterDto(progress.StoppedAtChapter.Volume, progress.StoppedAtChapter.Chapter),
                progress.ReadingStatus,
                progress.ReadingDescription,
                progress.StoppedAt
            );
    }
}
