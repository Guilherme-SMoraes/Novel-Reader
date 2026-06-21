using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;
using NovelReader.Domain.Tests.Helpers;

namespace NovelReader.Domain.Tests.Entities;

public class WorkTests
{
    [Fact]
    public void Should_CreateWork_WhenDataIsValid()
    {
        // Arrange
        var totalChapter = new WorkChapter(null, 2059);

        // Act
        var work = new Work("Overgeared", WorkType.WebNovel, "https://www.novelupdates.com/series/overgeared", totalChapter, Language.Korean);

        // Assert
        Assert.NotEqual(Guid.Empty, work.Id);
        Assert.Equal("Overgeared", work.Title);
        Assert.Equal(WorkType.WebNovel, work.WorkType);
        Assert.Equal("https://www.novelupdates.com/series/overgeared", work.AggregatorLink);
        Assert.Equal(Language.Korean, work.OriginalLanguage);
        Assert.Equal(new WorkChapter(null, 2059), work.TotalChapter);
        Assert.Null(work.Description);
        Assert.Null(work.LinkWhereToRead);
        Assert.Null(work.TranslatedUpTo);
        Assert.Null(work.TranslatedLanguage);
        Assert.Empty(work.Genres);
        Assert.Empty(work.Characters);
        Assert.Empty(work.Progresses);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenTitleIsInvalid(string? title)
    {
        var totalChapter = new WorkChapter(null, 2059);

        var act = () =>
            new Work(title!, WorkType.WebNovel, "https://www.novelupdates.com/series/overgeared", totalChapter, Language.Korean);

        Assert.Throws<ArgumentException>(act);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenAggregatorLinkIsInvalid(string? aggregatorLink)
    {
        var totalChapter = new WorkChapter(null, 2059);

        var act = () =>
            new Work("Overgeared", WorkType.WebNovel, aggregatorLink!, totalChapter, Language.Korean);

        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_AddGenre_WhenItDoesntExistOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var genre = EntityFactory.CreateValidGenre();

        work.AddGenre(genre);

        Assert.Single(work.Genres);
        Assert.Contains(work.Genres, x => x.Id == genre.Id);
    }

    [Fact]
    public void Should_IgnoreDuplicate_WhenGenreAlreadyExistsOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var genre = EntityFactory.CreateValidGenre();
        work.AddGenre(genre);

        work.AddGenre(genre);

        Assert.Single(work.Genres);
    }

    [Fact]
    public void Should_RemoveGenre_WhenExistsOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var genre = EntityFactory.CreateValidGenre();
        work.AddGenre(genre);

        work.RemoveGenre(genre.Id);

        Assert.Empty(work.Genres);
    }

    [Fact]
    public void Should_AddCharacter_WhenItDoesntExistOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var character = EntityFactory.CreateValidCharacter(work.Id);

        work.AddCharacter(character);

        Assert.Single(work.Characters);
        Assert.Contains(work.Characters, x => x.Id == character.Id);
    }

    [Fact]
    public void Should_IgnoreDuplicate_WhenCharacterAlreadyExistsOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var character = EntityFactory.CreateValidCharacter(work.Id);
        work.AddCharacter(character);

        work.AddCharacter(character);

        Assert.Single(work.Characters);
    }

    [Fact]
    public void Should_RemoveCharacter_WhenExistsOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var character = EntityFactory.CreateValidCharacter(work.Id);
        work.AddCharacter(character);

        work.RemoveCharacter(character.Id);

        Assert.Empty(work.Characters);
    }
    
    [Fact]
    public void Should_AddProgress_WhenItDoesntExistOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var progress = EntityFactory.CreateValidProgress(work.Id);

        work.AddProgress(progress);

        Assert.Single(work.Progresses);
        Assert.Contains(work.Progresses, x => x.Id == progress.Id);
    }

    [Fact]
    public void Should_IgnoreDuplicate_WhenProgressAlreadyExistsOnList()
    {
        var work = EntityFactory.CreateValidWork();
        var progress = EntityFactory.CreateValidProgress(work.Id);
        work.AddProgress(progress);

        work.AddProgress(progress);

        Assert.Single(work.Progresses);
    }
    
    [Fact]
    public void Should_UpdateTranslatedUpTo_WhenTranslatedUpToLessOrEqualThanTotalChapter()
    {
        var work = EntityFactory.CreateValidWork();
        var translatedUpTo = new WorkChapter(null, 2059);

        work.UpdateTranslatedChapters(translatedUpTo, Language.English);

        Assert.Equal(new WorkChapter(null, 2059), work.TranslatedUpTo);
    }
    
    [Fact]
    public void Should_ThrowInvalidOperationException_WhenTranslatedUpToGreaterThanTotalChapters()
    {
        var work = EntityFactory.CreateValidWork();
        var translatedUpTo = new WorkChapter(null, 2060);

        var act = () => 
            work.UpdateTranslatedChapters(translatedUpTo, Language.English);

        Assert.Throws<InvalidOperationException>(act);
    }

    [Fact]
    public void Should_UpdateTotalChapter_WhenTotalChapterGreaterThanTranslatedUpTo()
    {
        var work = EntityFactory.CreateValidWork();
        var translatedUpTo = new WorkChapter(null, 2059);
        var totalChapterUpdate = new WorkChapter(null, 2060);
        work.UpdateTranslatedChapters(translatedUpTo, Language.English);

        work.UpdateTotalChapters(totalChapterUpdate);

        Assert.Equal(new WorkChapter(null, 2060), work.TotalChapter);
    }
    
    [Fact]
    public void Should_ThrowInvalidOperationException_WhenTotalChapterLessThanTranslatedUpTo()
    {
        var work = EntityFactory.CreateValidWork();
        var translatedUpTo = new WorkChapter(null, 2059);
        var totalChapterUpdate = new WorkChapter(null, 2050);
        work.UpdateTranslatedChapters(translatedUpTo, Language.English);

        var act = () => work.UpdateTotalChapters(totalChapterUpdate);

        Assert.Throws<InvalidOperationException>(act);
    }

    [Fact]
    public void Should_ReturnNull_WhenTranslatedUpToIsNull()
    {
        var work = EntityFactory.CreateValidWork();
        Assert.Null(work.IsFullyTranslated);
    }

    [Fact]
    public void Should_ReturnTrue_WhenTranslatedUpToEqualsTotal()
    {
        var work = EntityFactory.CreateValidWork();
        work.UpdateTranslatedChapters(new WorkChapter(null, 2059), Language.English);
        Assert.True(work.IsFullyTranslated);
    }

    [Fact]
    public void Should_ReturnFalse_WhenTranslatedUpToIsLessThanTotal()
    {
        var work = EntityFactory.CreateValidWork();
        work.UpdateTranslatedChapters(new WorkChapter(null, 704), Language.English);
        Assert.False(work.IsFullyTranslated);
    }
}
