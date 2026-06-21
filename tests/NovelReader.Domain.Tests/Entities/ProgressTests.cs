using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Tests.Helpers;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Tests.Entities;

public class ProgressTests
{
    [Fact]
    public void Should_CreateProgress_WhenDataIsValid()
    {
        var stoppedAtChapter = new WorkChapter(null, 10);
        var work = EntityFactory.CreateValidWork();

        var progress = new Progress(work.Id, stoppedAtChapter, ReadingStatus.Reading);

        Assert.NotEqual(Guid.Empty, progress.Id);
        Assert.Equal(work.Id, progress.WorkId);
        Assert.Equal(stoppedAtChapter, progress.StoppedAtChapter);
        Assert.Equal(ReadingStatus.Reading, progress.ReadingStatus);
        Assert.Null(progress.ReadingDescription);
        Assert.True(progress.StoppedAt <= DateTime.UtcNow);
        Assert.True(progress.StoppedAt > DateTime.UtcNow.AddSeconds(-5));
    }
}