using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Tests.Helpers;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Tests.Entities;

public class CharacterTests
{
    [Fact]
    public void Should_CreateCharacter_WhenDataIsValid()
    {
        var firstAppearance = new WorkChapter(null, 1);
        var work = EntityFactory.CreateValidWork();

        var character = new Character("Greed", CharacterType.Protagonist, firstAppearance, work.Id);

        Assert.NotEqual(Guid.Empty, character.Id);
        Assert.Equal("Greed", character.Name);
        Assert.Equal(CharacterType.Protagonist, character.CharacterType);
        Assert.Equal(firstAppearance, character.FirstAppearance);
        Assert.Equal(work.Id, character.WorkId);
        Assert.Null(character.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenNameIsInvalid(string? name)
    {
        var firstAppearance = new WorkChapter(null, 1);
        var work = EntityFactory.CreateValidWork();
        
        var act = () => new Character(name!, CharacterType.Protagonist, firstAppearance, work.Id);

        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_ThrowArgumentException_WhenWorkIdIsEmpty()
    {
        var firstAppearance = new WorkChapter(null, 1);
        
        var act = () => new Character("Greed", CharacterType.Protagonist, firstAppearance, Guid.Empty);
        
        Assert.Throws<ArgumentException>(act);
    }

    
}