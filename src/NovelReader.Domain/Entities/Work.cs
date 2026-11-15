using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Entities
{
    public class Work
    {
        public Guid Id { get; private set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public List<Genre> Genres { get; private set; }
        public WorkType WorkType { get; init; }
        public string AggregatorLink { get; set; }
        public string? LinkWhereToRead { get; set; }
        public string? CoverImageUrl { get; set; }
        public WorkChapter TotalChapter { get; private set; }
        public WorkChapter? TranslatedUpTo { get; private set; }
        public bool? IsFullyTranslated => TranslatedUpTo == null ? null : TotalChapter == TranslatedUpTo;
        public Language OriginalLanguage { get; init; }
        public Language? TranslatedLanguage { get; private set; }
        public List<Character> Characters { get; private set; }
        public List<Progress> Progresses { get; private set; }
        public List<Attachment> Attachments { get; private set; }

#pragma warning disable CS8618
        private Work(){ }
#pragma warning restore CS8618
        public Work(string title, 
                    WorkType workType, 
                    string aggregatorLink, 
                    WorkChapter totalChapter,
                    Language originalLanguage)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                throw new ArgumentException("Título não pode ser vazio");
            }
            if (string.IsNullOrWhiteSpace(aggregatorLink))
            {
                throw new ArgumentException("O Link do agregador não pode ser vazio");
            }

            Id = Guid.NewGuid();
            Title = title;
            WorkType = workType;
            AggregatorLink = aggregatorLink;
            TotalChapter = totalChapter;
            OriginalLanguage = originalLanguage;
            Genres = new();
            Characters = new();
            Progresses = new();
            Attachments = new();
        }

        public void AddGenre(Genre genre)
        {
            if (Genres.Any(x => x.Id == genre.Id))
            {
                return;
            }
            Genres.Add(genre);
        }
        public void RemoveGenre(Guid id)
        {
            Genres.RemoveAll(x => x.Id == id);
        }
        public void AddCharacter(Character character)
        {
            if(Characters.Any(x => x.Id == character.Id))
            {
                return;
            }
            Characters.Add(character);
        }
        public void RemoveCharacter(Guid id)
        {
            Characters.RemoveAll(x => x.Id==id);
        }
        public void AddProgress(Progress progress)
        {
            if(Progresses.Any(x => x.Id == progress.Id))
            {
                return;
            }
            Progresses.Add(progress);
        }
        public void AddAttachment(Attachment attachment)
        {
            if (Attachments.Any(x => x.Id == attachment.Id))
            {
                return;
            }
            Attachments.Add(attachment);
        }
        public void RemoveAttachment(Guid id)
        {
            Attachments.RemoveAll(x => x.Id == id);
        }
        public void UpdateTotalChapters(WorkChapter totalChapter)
        {
            if(TranslatedUpTo != null && totalChapter < TranslatedUpTo)
            {
                throw new InvalidOperationException("O total de capítulos não pode ser menor que os capítulos traduzidos.");
            }
            TotalChapter = totalChapter;
        }

        public void UpdateTranslatedChapters(WorkChapter translatedChapters, Language translatedLanguage)
        {
            if(translatedChapters > TotalChapter)
            {
                throw new InvalidOperationException("Os capítulos traduzidos não podem ultrapassar o total de capítulos.");
            }
            TranslatedUpTo = translatedChapters;
            TranslatedLanguage = translatedLanguage;
        }
    }
}