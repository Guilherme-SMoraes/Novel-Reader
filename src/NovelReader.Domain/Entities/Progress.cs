using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Entities
{
    public class Progress
    {
        public Guid Id { get; init; }
        public Guid WorkId { get; init; }
        public WorkType WorkType { get; init; }
        public WorkChapter StoppedAtChapter { get; init; }
        public ReadingStatus ReadingStatus { get; init; }
        public string? ReadingDescription { get; set; }
        public DateTime StoppedAt { get; init; }

#pragma warning disable CS8618
        private Progress() { }
#pragma warning restore CS8618

        public Progress(Guid workId, WorkType workType, WorkChapter stoppedAtChapter, ReadingStatus readingStatus)
        {
            if (workId == Guid.Empty)
            {
                throw new ArgumentException("WorkId não pode ser vazio");
            }

            Id = Guid.NewGuid();
            WorkId = workId;
            WorkType = workType;
            StoppedAtChapter = stoppedAtChapter;
            ReadingStatus = readingStatus;
            StoppedAt = DateTime.UtcNow;
        }
    }
}
