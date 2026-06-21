using Microsoft.EntityFrameworkCore;
using NovelReader.Infrastructure.Persistence;
using Testcontainers.PostgreSql;

namespace NovelReader.Integration.Tests.Fixture;

public class DatabaseFixture : IAsyncLifetime
{
    private PostgreSqlContainer _container;
    private AppDbContext _context;
    public string ConnectionString { get; private set; }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
        await _container.DisposeAsync();
    }

    public async Task InitializeAsync()
    {
        _container = new PostgreSqlBuilder("postgres:16").Build();
        
        await _container.StartAsync();

        ConnectionString = _container.GetConnectionString();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        _context = new AppDbContext(options);

        await _context.Database.EnsureCreatedAsync();
    }
}

[CollectionDefinition("Integration")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture>;