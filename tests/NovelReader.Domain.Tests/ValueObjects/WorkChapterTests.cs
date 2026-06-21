using NovelReader.Domain.ValueObjects;

namespace NovelReader.Domain.Tests.ValueObjects;

public class WorkChapterTests
{
    [Theory]
    [InlineData(null)]
    [InlineData(1)]
    public void Should_CreateWorkChapter_WhenDataIsValid(int? volume)
    {
        var workChapter = new WorkChapter(volume, 10);

        Assert.Equal(volume, workChapter.Volume);
        Assert.Equal(10, workChapter.Chapter);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_ThrowArgumentOutOfRangeException_WhenVolumeIsZeroOrLess(int volume)
    {
        var act = () => new WorkChapter(volume, 10);
        Assert.Throws<ArgumentOutOfRangeException>(act);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_ThrowArgumentOutOfRangeException_WhenChapterIsZeroOrLess(int chapter)
    {
        var act = () => new WorkChapter(null, chapter);
        Assert.Throws<ArgumentOutOfRangeException>(act);
    }

    [Theory]
    [InlineData(1, 2)]
    [InlineData(5, 100)]
    public void Should_BeLessThan_WhenChapterIsLower(int left, int right)
    {
        var leftChapter = new WorkChapter(null, left);
        var rightChapter = new WorkChapter(null, right);

        Assert.True(leftChapter < rightChapter);
    }

    [Theory]
    [InlineData(2, 1)]
    [InlineData(100, 5)]
    public void Should_BeGreaterThan_WhenChapterIsHigher(int left, int right)
    {
        var leftChapter = new WorkChapter(null, left);
        var rightChapter = new WorkChapter(null, right);

        Assert.True(leftChapter > rightChapter);
    }

    [Theory]
    [InlineData(null, 10)]
    [InlineData(1, 10)]
    public void Should_BeEqual_WhenBothHaveTheSameValues(int? volume, int chapter)
    {
        var left = new WorkChapter(volume, chapter);
        var right = new WorkChapter(volume, chapter);

        Assert.Equal(left, right);
    }

    [Theory]
    [InlineData(1, 2)]
    [InlineData(1, 1)]
    [InlineData(5, 100)]
    public void Should_BeLessThanOrEqual_WhenChapterIsLowerOrEqual(int left, int right)
    {
        var leftChapter = new WorkChapter(null, left);
        var rightChapter = new WorkChapter(null, right);

        Assert.True(leftChapter <= rightChapter);
    }

    [Theory]
    [InlineData(2, 1)]
    [InlineData(2, 2)]
    [InlineData(100, 5)]
    public void Should_BeGreaterThanOrEqual_WhenChapterIsHigherOrEqual(int left, int right)
    {
        var leftChapter = new WorkChapter(null, left);
        var rightChapter = new WorkChapter(null, right);

        Assert.True(leftChapter >= rightChapter);
    }

    [Theory]
    [InlineData(1, 2)]
    [InlineData(5, 10)]
    public void Should_BeLessThan_WhenVolumeIsLower(int left, int right)
    {
        var leftChapter = new WorkChapter(left, 10);
        var rightChapter = new WorkChapter(right, 10);

        Assert.True(leftChapter < rightChapter);
    }

    [Theory]
    [InlineData(2, 1)]
    [InlineData(10, 5)]
    public void Should_BeGreaterThan_WhenVolumeIsHigher(int left, int right)
    {
        var leftChapter = new WorkChapter(left, 10);
        var rightChapter = new WorkChapter(right, 10);

        Assert.True(leftChapter > rightChapter);
    }

    [Theory]
    [InlineData(1, 2)]
    [InlineData(1, 1)]
    [InlineData(5, 10)]
    public void Should_BeLessThanOrEqual_WhenVolumeIsLowerOrEqual(int left, int right)
    {
        var leftChapter = new WorkChapter(left, 10);
        var rightChapter = new WorkChapter(right, 10);

        Assert.True(leftChapter <= rightChapter);
    }

    [Theory]
    [InlineData(2, 1)]
    [InlineData(2, 2)]
    [InlineData(10, 5)]
    public void Should_BeGreaterThanOrEqual_WhenVolumeIsHigherOrEqual(int left, int right)
    {
        var leftChapter = new WorkChapter(left, 10);
        var rightChapter = new WorkChapter(right, 10);

        Assert.True(leftChapter >= rightChapter);
    }

    [Fact]
    public void Should_CompareByChapter_WhenOnlyOneHasVolume()
    {
        var withVolume = new WorkChapter(1, 5);
        var withoutVolume = new WorkChapter(null, 10);

        Assert.True(withVolume < withoutVolume);
    }

}