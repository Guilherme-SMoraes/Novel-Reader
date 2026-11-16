using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;
using NovelReader.Common.Tests.Helpers;

namespace NovelReader.Domain.Tests.Entities;

public class WorkTests
{
    [Fact]
    public void Should_CreateWork_WhenDataIsValid()
    {
        var work = new Work("Overgeared", "https://www.novelupdates.com/series/overgeared", Language.Korean);

        Assert.NotEqual(Guid.Empty, work.Id);
        Assert.Equal("Overgeared", work.Title);
        Assert.Equal("https://www.novelupdates.com/series/overgeared", work.AggregatorLink);
        Assert.Equal(Language.Korean, work.OriginalLanguage);
        Assert.Null(work.Description);
        Assert.Null(work.CoverImageUrl);
        Assert.Empty(work.Formats);
        Assert.Empty(work.Genres);
        Assert.Empty(work.Characters);
        Assert.Empty(work.Progresses);
        Assert.Empty(work.Attachments);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenTitleIsInvalid(string? title)
    {
        var act = () =>
            new Work(title!, "https://www.novelupdates.com/series/overgeared", Language.Korean);

        Assert.Throws<ArgumentException>(act);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenAggregatorLinkIsInvalid(string? aggregatorLink)
    {
        var act = () =>
            new Work("Overgeared", aggregatorLink!, Language.Korean);

        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_AddFormat_WhenWorkTypeNotPresent()
    {
        var work = EntityFactory.CreateValidWork();
        var newFormat = new WorkFormat(work.Id, WorkType.Manhwa, new WorkChapter(null, 200));

        work.AddFormat(newFormat);

        Assert.Equal(2, work.Formats.Count);
        Assert.Contains(work.Formats, f => f.WorkType == WorkType.Manhwa);
    }

    [Fact]
    public void Should_ThrowInvalidOperationException_WhenFormatAlreadyExists()
    {
        var work = EntityFactory.CreateValidWork();
        var duplicateFormat = new WorkFormat(work.Id, WorkType.WebNovel, new WorkChapter(null, 100));

        var act = () => work.AddFormat(duplicateFormat);

        Assert.Throws<InvalidOperationException>(act);
    }

    [Fact]
    public void Should_RemoveFormat_WhenMultipleFormatsExist()
    {
        var work = EntityFactory.CreateValidWork();
        work.AddFormat(new WorkFormat(work.Id, WorkType.Manhwa, new WorkChapter(null, 200)));

        work.RemoveFormat(WorkType.Manhwa);

        Assert.Single(work.Formats);
        Assert.DoesNotContain(work.Formats, f => f.WorkType == WorkType.Manhwa);
    }

    [Fact]
    public void Should_ThrowInvalidOperationException_WhenRemovingLastFormat()
    {
        var work = EntityFactory.CreateValidWork();

        var act = () => work.RemoveFormat(WorkType.WebNovel);

        Assert.Throws<InvalidOperationException>(act);
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
    public void Should_SetAlternativeTitles_TrimmingAndRemovingDuplicates()
    {
        var work = EntityFactory.CreateValidWork();

        work.SetAlternativeTitles(new[] { "  Shadow Slave  ", "SS", "shadow slave", "", "   ", "Escravo das Sombras" });

        Assert.Equal(3, work.AlternativeTitles.Count);
        Assert.Equal(new[] { "Shadow Slave", "SS", "Escravo das Sombras" }, work.AlternativeTitles);
    }

    [Theory]
    [InlineData(WorkType.Donghua)]
    [InlineData(WorkType.LiveAction)]
    [InlineData(WorkType.Dorama)]
    [InlineData(WorkType.Series)]
    [InlineData(WorkType.Movie)]
    public void Should_Support_New_Watchable_WorkTypes(WorkType workType)
    {
        var work = EntityFactory.CreateValidWork();
        var format = new WorkFormat(work.Id, workType, new WorkChapter(null, 24));

        work.AddFormat(format);

        Assert.Contains(work.Formats, f => f.WorkType == workType && f.TotalChapter.Chapter == 24);
    }
}
