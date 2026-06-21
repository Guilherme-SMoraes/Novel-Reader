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
        Assert.Equal(work.WorkType, result.WorkType);
        Assert.Equal(work.AggregatorLink, result.AggregatorLink);
        Assert.Equal(work.OriginalLanguage, result.OriginalLanguage);
        Assert.Equal(work.TotalChapter, result.TotalChapter);
        Assert.Null(result.Description);
        Assert.Null(result.LinkWhereToRead);
        Assert.Null(result.TranslatedUpTo);
        Assert.Null(result.TranslatedLanguage);
        Assert.Empty(result.Genres);
        Assert.Empty(result.Characters);
        Assert.Empty(result.Progresses);
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