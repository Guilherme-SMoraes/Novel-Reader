using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Entities
{
    public class WorkFormat
    {
        public Guid Id { get; private set; }
        public Guid WorkId { get; private set; }
        public WorkType WorkType { get; private set; }
        public WorkChapter TotalChapter { get; private set; }
        public WorkChapter? TranslatedUpTo { get; private set; }
        public bool? IsFullyTranslated => TranslatedUpTo == null ? null : TotalChapter == TranslatedUpTo;
        public Language? TranslatedLanguage { get; private set; }
        public string? LinkWhereToRead { get; set; }

#pragma warning disable CS8618
        private WorkFormat() { }
#pragma warning restore CS8618

        public WorkFormat(Guid workId, WorkType workType, WorkChapter totalChapter, string? linkWhereToRead = null)
        {
            if (workId == Guid.Empty)
            {
                throw new ArgumentException("WorkId não pode ser vazio");
            }

            Id = Guid.NewGuid();
            WorkId = workId;
            WorkType = workType;
            TotalChapter = totalChapter;
            LinkWhereToRead = linkWhereToRead;
        }

        public void UpdateTotalChapters(WorkChapter totalChapter)
        {
            if (TranslatedUpTo != null && totalChapter < TranslatedUpTo)
            {
                throw new InvalidOperationException("O total de capítulos não pode ser menor que os capítulos traduzidos.");
            }
            TotalChapter = totalChapter;
        }

        public void UpdateTranslatedChapters(WorkChapter translatedChapters, Language translatedLanguage)
        {
            if (translatedChapters > TotalChapter)
            {
                throw new InvalidOperationException("Os capítulos traduzidos não podem ultrapassar o total de capítulos.");
            }
            TranslatedUpTo = translatedChapters;
            TranslatedLanguage = translatedLanguage;
        }

        public void ClearTranslatedChapters()
        {
            TranslatedUpTo = null;
            TranslatedLanguage = null;
        }
    }
}
