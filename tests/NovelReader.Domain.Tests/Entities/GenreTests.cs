using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Tests.Entities;

public class GenreTests
{
    [Fact]
    public void Should_CreateGenre_WhenDataIsValid()
    {
        var genre = new Genre("Ação");

        Assert.NotEqual(Guid.Empty, genre.Id);
        Assert.Equal("Ação", genre.Name);
        Assert.Null(genre.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenNameIsInvalid(string? name)
    {
        var act = () => new Genre(name!);

        Assert.Throws<ArgumentException>(act);
    }
}