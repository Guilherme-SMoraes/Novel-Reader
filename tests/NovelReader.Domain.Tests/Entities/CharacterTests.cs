using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Tests.Entities;

public class CharacterTests
{
    [Fact]
    public void Should_CreateCharacter_WhenDataIsValid()
    {
        var work = EntityFactory.CreateValidWork();
        var appearances = new[] { new CharacterAppearance(work.Id, WorkType.WebNovel, new WorkChapter(null, 1)) };

        var character = new Character("Greed", CharacterType.Protagonist, work.Id, appearances);

        Assert.NotEqual(Guid.Empty, character.Id);
        Assert.Equal("Greed", character.Name);
        Assert.Equal(CharacterType.Protagonist, character.CharacterType);
        Assert.Single(character.FirstAppearances);
        Assert.Equal(work.Id, character.WorkId);
        Assert.Null(character.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenNameIsInvalid(string? name)
    {
        var work = EntityFactory.CreateValidWork();
        
        var act = () => new Character(name!, CharacterType.Protagonist, work.Id);

        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_ThrowArgumentException_WhenWorkIdIsEmpty()
    {
        var act = () => new Character("Greed", CharacterType.Protagonist, Guid.Empty);
        
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_ThrowInvalidOperationException_WhenSettingEmptyFirstAppearances()
    {
        var work = EntityFactory.CreateValidWork();
        var character = new Character("Greed", CharacterType.Protagonist, work.Id);

        var act = () => character.SetFirstAppearances(new List<CharacterAppearance>());

        Assert.Throws<InvalidOperationException>(act);
    }

    [Fact]
    public void Should_SetAlternativeNames_Correctly_And_Sanitize()
    {
        var work = EntityFactory.CreateValidWork();
        var character = new Character("Sunny", CharacterType.Protagonist, work.Id);

        character.SetAlternativeNames(new[] { "Sunless", "  Mongrel  ", "SUNLESS", "", "   ", "Lord Shadow" });

        Assert.Equal(3, character.AlternativeNames.Count);
        Assert.Contains("Sunless", character.AlternativeNames);
        Assert.Contains("Mongrel", character.AlternativeNames);
        Assert.Contains("Lord Shadow", character.AlternativeNames);
    }
}
