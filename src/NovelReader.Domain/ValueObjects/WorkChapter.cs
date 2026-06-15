namespace NovelReader.Domain.ValueObjects
{
    public record WorkChapter(int? Volume, int Chapter) : IComparable<WorkChapter>
    {
        public int? Volume { get; init; } = Volume.HasValue && Volume <= 0 ? 
            throw new ArgumentOutOfRangeException(nameof(Volume), "O Volume deve ser maior que zero") :
            Volume;

        public int Chapter { get; init; } = Chapter <= 0 ?
            throw new ArgumentOutOfRangeException(nameof(Chapter), "O Capitulo deve ser maior que zero") :
            Chapter;
        public int CompareTo(WorkChapter? other)
        {
            if(other is null)
            {
                return 1;
            }

            if(Volume.HasValue && other.Volume.HasValue)
            {
                var volumeComparison = Volume.Value.CompareTo(other.Volume.Value);
                return volumeComparison != 0 ? volumeComparison : Chapter.CompareTo(other.Chapter);
            }

            return Chapter.CompareTo(other.Chapter);
        }

        public static bool operator <(WorkChapter left, WorkChapter right) => left.CompareTo(right) < 0;
        public static bool operator >(WorkChapter left, WorkChapter right) => left.CompareTo(right) > 0;
        public static bool operator <=(WorkChapter left, WorkChapter right) => left.CompareTo(right) <= 0;
        public static bool operator >=(WorkChapter left, WorkChapter right) => left.CompareTo(right) >= 0;
    }
}