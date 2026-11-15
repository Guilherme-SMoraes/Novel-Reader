using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Entities
{
    public class Character
    {
        public Guid Id { get; init; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public CharacterType CharacterType { get; set; }
        public WorkChapter FirstAppearance { get; init; }
        public Guid WorkId { get; init; }

#pragma warning disable CS8618
        private Character(){ }
#pragma warning restore CS8618

        public Character(string name, CharacterType characterType, WorkChapter firstAppearance, Guid workId)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("O nome do personagem não pode ser vazio");
            }
            if(workId == Guid.Empty)
            {
                throw new ArgumentException("WorkId Inválido");
            }

            Id = Guid.NewGuid();
            Name = name;
            CharacterType = characterType;
            FirstAppearance = firstAppearance;
            WorkId = workId;
        }
    }
}