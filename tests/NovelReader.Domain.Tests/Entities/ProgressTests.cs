using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Tests.Entities;

public class ProgressTests
{
    [Fact]
    public void Should_CreateProgress_WhenDataIsValid()
    {
        var stoppedAtChapter = new WorkChapter(null, 10);
        var work = EntityFactory.CreateValidWork();

        var progress = new Progress(work.Id, WorkType.WebNovel, stoppedAtChapter, ReadingStatus.Reading);

        Assert.NotEqual(Guid.Empty, progress.Id);
        Assert.Equal(work.Id, progress.WorkId);
        Assert.Equal(WorkType.WebNovel, progress.WorkType);
        Assert.Equal(stoppedAtChapter, progress.StoppedAtChapter);
        Assert.Equal(ReadingStatus.Reading, progress.ReadingStatus);
        Assert.Null(progress.ReadingDescription);
        Assert.True(progress.StoppedAt <= DateTime.UtcNow);
        Assert.True(progress.StoppedAt > DateTime.UtcNow.AddSeconds(-5));
    }

    [Fact]
    public void Should_ThrowArgumentException_WhenWorkIdIsEmpty()
    {
        var stoppedAtChapter = new WorkChapter(null, 10);

        var act = () => new Progress(Guid.Empty, WorkType.WebNovel, stoppedAtChapter, ReadingStatus.Reading);

        Assert.Throws<ArgumentException>(act);
    }
}
