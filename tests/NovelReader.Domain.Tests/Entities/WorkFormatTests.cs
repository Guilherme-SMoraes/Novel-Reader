using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Tests.Entities;

public class WorkFormatTests
{
    [Fact]
    public void Should_CreateWorkFormat_WhenDataIsValid()
    {
        var workId = Guid.NewGuid();
        var totalChapter = new WorkChapter(null, 2059);

        var format = new WorkFormat(workId, WorkType.WebNovel, totalChapter, "https://wuxiaworld.com");

        Assert.NotEqual(Guid.Empty, format.Id);
        Assert.Equal(workId, format.WorkId);
        Assert.Equal(WorkType.WebNovel, format.WorkType);
        Assert.Equal(totalChapter, format.TotalChapter);
        Assert.Equal("https://wuxiaworld.com", format.LinkWhereToRead);
        Assert.Null(format.TranslatedUpTo);
        Assert.Null(format.TranslatedLanguage);
        Assert.Null(format.IsFullyTranslated);
    }

    [Fact]
    public void Should_ThrowArgumentException_WhenWorkIdIsEmpty()
    {
        var totalChapter = new WorkChapter(null, 2059);

        var act = () => new WorkFormat(Guid.Empty, WorkType.WebNovel, totalChapter);

        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_UpdateTranslatedUpTo_WhenTranslatedUpToLessOrEqualThanTotalChapter()
    {
        var format = new WorkFormat(Guid.NewGuid(), WorkType.WebNovel, new WorkChapter(null, 2059));
        var translatedUpTo = new WorkChapter(null, 2059);

        format.UpdateTranslatedChapters(translatedUpTo, Language.English);

        Assert.Equal(new WorkChapter(null, 2059), format.TranslatedUpTo);
        Assert.Equal(Language.English, format.TranslatedLanguage);
    }

    [Fact]
    public void Should_ThrowInvalidOperationException_WhenTranslatedUpToGreaterThanTotalChapters()
    {
        var format = new WorkFormat(Guid.NewGuid(), WorkType.WebNovel, new WorkChapter(null, 2059));
        var translatedUpTo = new WorkChapter(null, 2060);

        var act = () => format.UpdateTranslatedChapters(translatedUpTo, Language.English);

        Assert.Throws<InvalidOperationException>(act);
    }

    [Fact]
    public void Should_UpdateTotalChapter_WhenTotalChapterGreaterThanTranslatedUpTo()
    {
        var format = new WorkFormat(Guid.NewGuid(), WorkType.WebNovel, new WorkChapter(null, 2059));
        format.UpdateTranslatedChapters(new WorkChapter(null, 2059), Language.English);

        format.UpdateTotalChapters(new WorkChapter(null, 2060));

        Assert.Equal(new WorkChapter(null, 2060), format.TotalChapter);
    }

    [Fact]
    public void Should_ThrowInvalidOperationException_WhenTotalChapterLessThanTranslatedUpTo()
    {
        var format = new WorkFormat(Guid.NewGuid(), WorkType.WebNovel, new WorkChapter(null, 2059));
        format.UpdateTranslatedChapters(new WorkChapter(null, 2059), Language.English);

        var act = () => format.UpdateTotalChapters(new WorkChapter(null, 2050));

        Assert.Throws<InvalidOperationException>(act);
    }

    [Fact]
    public void Should_ReturnNull_WhenTranslatedUpToIsNull()
    {
        var format = new WorkFormat(Guid.NewGuid(), WorkType.WebNovel, new WorkChapter(null, 2059));
        Assert.Null(format.IsFullyTranslated);
    }

    [Fact]
    public void Should_ReturnTrue_WhenTranslatedUpToEqualsTotal()
    {
        var format = new WorkFormat(Guid.NewGuid(), WorkType.WebNovel, new WorkChapter(null, 2059));
        format.UpdateTranslatedChapters(new WorkChapter(null, 2059), Language.English);
        Assert.True(format.IsFullyTranslated);
    }

    [Fact]
    public void Should_ReturnFalse_WhenTranslatedUpToIsLessThanTotal()
    {
        var format = new WorkFormat(Guid.NewGuid(), WorkType.WebNovel, new WorkChapter(null, 2059));
        format.UpdateTranslatedChapters(new WorkChapter(null, 704), Language.English);
        Assert.False(format.IsFullyTranslated);
    }
}
