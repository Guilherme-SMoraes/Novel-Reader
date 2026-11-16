using NovelReader.Domain.Enums;

namespace NovelReader.Domain.Entities
{
    public class Character
    {
        public Guid Id { get; init; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public CharacterType CharacterType { get; set; }
        public Guid WorkId { get; init; }
        public List<CharacterAppearance> FirstAppearances { get; private set; } = new();
        public List<string> AlternativeNames { get; set; } = new();
        public List<string> Affiliations { get; set; } = new();

#pragma warning disable CS8618
        private Character() { }
#pragma warning restore CS8618

        public Character(string name, CharacterType characterType, Guid workId, IEnumerable<CharacterAppearance>? firstAppearances = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("O nome do personagem não pode ser vazio");
            }
            if (workId == Guid.Empty)
            {
                throw new ArgumentException("WorkId Inválido");
            }

            Id = Guid.NewGuid();
            Name = name.Trim();
            CharacterType = characterType;
            WorkId = workId;

            if (firstAppearances != null)
            {
                SetFirstAppearances(firstAppearances);
            }
        }

        public void SetFirstAppearances(IEnumerable<CharacterAppearance>? appearances)
        {
            var list = appearances?
                .Where(a => a != null)
                .GroupBy(a => a.WorkType)
                .Select(g => g.First())
                .ToList() ?? new List<CharacterAppearance>();

            if (list.Count == 0)
            {
                throw new InvalidOperationException("O personagem deve ter a primeira aparição preenchida em pelo menos um formato.");
            }

            FirstAppearances = list;
        }

        public void AddFirstAppearance(CharacterAppearance appearance)
        {
            ArgumentNullException.ThrowIfNull(appearance);
            if (FirstAppearances.Any(a => a.WorkType == appearance.WorkType))
            {
                throw new InvalidOperationException($"Primeira aparição para o formato {appearance.WorkType} já cadastrada.");
            }
            FirstAppearances.Add(appearance);
        }

        public void SetAlternativeNames(IEnumerable<string>? names)
        {
            AlternativeNames = names?
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .Select(n => n.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();
        }

        public void SetAffiliations(IEnumerable<string>? affiliations)
        {
            Affiliations = affiliations?
                .Where(a => !string.IsNullOrWhiteSpace(a))
                .Select(a => a.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();
        }
    }
}
