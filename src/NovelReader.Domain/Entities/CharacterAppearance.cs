using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Entities
{
    public class CharacterAppearance
    {
        public Guid Id { get; init; }
        public Guid CharacterId { get; init; }
        public WorkType WorkType { get; init; }
        public WorkChapter Chapter { get; private set; }

#pragma warning disable CS8618
        private CharacterAppearance() { }
#pragma warning restore CS8618

        public CharacterAppearance(Guid characterId, WorkType workType, WorkChapter chapter)
        {
            if (characterId == Guid.Empty)
            {
                throw new ArgumentException("CharacterId inválido.");
            }

            Id = Guid.NewGuid();
            CharacterId = characterId;
            WorkType = workType;
            Chapter = chapter ?? throw new ArgumentNullException(nameof(chapter));
        }

        public void UpdateChapter(WorkChapter chapter)
        {
            Chapter = chapter ?? throw new ArgumentNullException(nameof(chapter));
        }
    }
}
