using Microsoft.EntityFrameworkCore;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Infrastructure.Persistence;
using NovelReader.Infrastructure.Persistence.Repositories;
using NovelReader.Integration.Tests.Fixture;

namespace NovelReader.Integration.Tests.Persistence.Repositories;

[Collection("Integration")]
public class WorkRepositoryTests
{
    private string _connectionString;
    public WorkRepositoryTests(DatabaseFixture databaseFixture)
    {
        _connectionString = databaseFixture.ConnectionString;
    }

    [Fact]
    public async Task Should_CreateWork_WhenDataIsValid()
    {
        var repository = CreateWorkRepository();
        var work = EntityFactory.CreateValidWork();

        await repository.CreateAsync(work, CancellationToken.None);

        var assertRepository = CreateWorkRepository();
        var result = await assertRepository.GetByIdAsync(work.Id, CancellationToken.None);
        Assert.NotNull(result);
        Assert.Equal(work.Title, result.Title);
        Assert.Equal(work.AggregatorLink, result.AggregatorLink);
        Assert.Equal(work.OriginalLanguage, result.OriginalLanguage);
        Assert.Null(result.Description);
        Assert.Single(result.Formats);
        var format = result.Formats.First();
        Assert.Equal(NovelReader.Domain.Enums.WorkType.WebNovel, format.WorkType);
        Assert.Equal(new NovelReader.Domain.ValueObjects.WorkChapter(null, 2059), format.TotalChapter);
        Assert.Null(format.LinkWhereToRead);
        Assert.Null(format.TranslatedUpTo);
        Assert.Null(format.TranslatedLanguage);
        Assert.Empty(result.Genres);
        Assert.Empty(result.Characters);
        Assert.Empty(result.Progresses);
    }

    [Fact]
    public async Task Should_AddAndRemoveFormats_WhenWorkIsUpdated()
    {
        var repository = CreateWorkRepository();
        var work = EntityFactory.CreateValidWork();
        await repository.CreateAsync(work, CancellationToken.None);

        var workToUpdate = new NovelReader.Domain.Entities.Work(work.Id, work.Title, work.AggregatorLink, work.OriginalLanguage);
        var manhwaFormat = new NovelReader.Domain.Entities.WorkFormat(
            work.Id,
            NovelReader.Domain.Enums.WorkType.Manhwa,
            new NovelReader.Domain.ValueObjects.WorkChapter(null, 250),
            "https://example.com/manhwa"
        );
        workToUpdate.AddFormat(manhwaFormat);

        var updateRepository = CreateWorkRepository();
        await updateRepository.UpdateAsync(workToUpdate, CancellationToken.None);

        var assertRepository = CreateWorkRepository();
        var updated = await assertRepository.GetByIdAsync(work.Id, CancellationToken.None);
        Assert.NotNull(updated);
        Assert.Single(updated.Formats);
        var savedFormat = updated.Formats.First();
        Assert.Equal(NovelReader.Domain.Enums.WorkType.Manhwa, savedFormat.WorkType);
        Assert.Equal(new NovelReader.Domain.ValueObjects.WorkChapter(null, 250), savedFormat.TotalChapter);
        Assert.Equal("https://example.com/manhwa", savedFormat.LinkWhereToRead);
    }

    private WorkRepository CreateWorkRepository()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_connectionString)
            .Options;

        var context = new AppDbContext(options);
        return new WorkRepository(context);
    }
}