using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Entities
{
    public class Progress
    {
        public Guid Id { get; init; }
        public Guid WorkId { get; init; }
        public WorkChapter StoppedAtChapter { get; init; }
        public ReadingStatus ReadingStatus { get; init; }
        public string? ReadingDescription { get; set; }
        public DateTime StoppedAt { get; init; }

        private Progress(){ }
        public Progress(Guid workId, WorkChapter stoppedAtChapter, ReadingStatus readingStatus)
        {
            Id = Guid.NewGuid();
            WorkId = workId;
            StoppedAtChapter = stoppedAtChapter;
            ReadingStatus = readingStatus;
            StoppedAt = DateTime.UtcNow;
        }
    }
}