namespace NovelReader.Domain.Entities
{
    public class Genre
    {
        public Guid Id { get; init;}
        public string Name { get; set; }
        public string? Description { get; set; }

        public Genre(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Nome do gênero não pode ser vazio");
            }

            Id = Guid.NewGuid();
            Name = name;
        }
    }
}