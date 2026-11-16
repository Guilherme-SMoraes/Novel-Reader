using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Entities
{
    public class Work
    {
        public Guid Id { get; private set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public List<Genre> Genres { get; private set; } = new();
        public string AggregatorLink { get; set; }
        public string? CoverImageUrl { get; set; }
        public Language OriginalLanguage { get; init; }
        public List<string> AlternativeTitles { get; private set; } = new();
        public List<WorkFormat> Formats { get; private set; } = new();
        public List<Character> Characters { get; private set; } = new();
        public List<Progress> Progresses { get; private set; } = new();
        public List<Attachment> Attachments { get; private set; } = new();

#pragma warning disable CS8618
        private Work() { }
#pragma warning restore CS8618

        public Work(string title,
                    string aggregatorLink,
                    Language originalLanguage)
            : this(Guid.NewGuid(), title, aggregatorLink, originalLanguage)
        {
        }

        public Work(Guid id,
                    string title,
                    string aggregatorLink,
                    Language originalLanguage)
        {
            if (id == Guid.Empty)
            {
                throw new ArgumentException("Id não pode ser vazio");
            }
            if (string.IsNullOrWhiteSpace(title))
            {
                throw new ArgumentException("Título não pode ser vazio");
            }
            if (string.IsNullOrWhiteSpace(aggregatorLink))
            {
                throw new ArgumentException("O Link do agregador não pode ser vazio");
            }

            Id = id;
            Title = title;
            AggregatorLink = aggregatorLink;
            OriginalLanguage = originalLanguage;
            AlternativeTitles = new();
            Formats = new();
            Genres = new();
            Characters = new();
            Progresses = new();
            Attachments = new();
        }

        public void AddFormat(WorkFormat format)
        {
            if (Formats.Any(x => x.WorkType == format.WorkType))
            {
                throw new InvalidOperationException($"A obra já possui o formato {format.WorkType}.");
            }
            Formats.Add(format);
        }

        public void RemoveFormat(WorkType workType)
        {
            if (Formats.Count <= 1)
            {
                throw new InvalidOperationException("A obra deve conter pelo menos um formato.");
            }
            Formats.RemoveAll(x => x.WorkType == workType);
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
            if (Characters.Any(x => x.Id == character.Id))
            {
                return;
            }
            Characters.Add(character);
        }

        public void RemoveCharacter(Guid id)
        {
            Characters.RemoveAll(x => x.Id == id);
        }

        public void AddProgress(Progress progress)
        {
            if (Progresses.Any(x => x.Id == progress.Id))
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

        public void SetAlternativeTitles(IEnumerable<string>? titles)
        {
            AlternativeTitles = titles?
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();
        }
    }
}
