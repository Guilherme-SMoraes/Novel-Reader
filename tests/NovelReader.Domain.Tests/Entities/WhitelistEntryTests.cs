using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Tests.Entities;

public class WhitelistEntryTests
{
    [Fact]
    public void Should_CreateWhitelistEntry_WhenEmailIsValid()
    {
        var entry = new WhitelistEntry("User@Example.COM", "Admin");

        Assert.NotEqual(Guid.Empty, entry.Id);
        Assert.Equal("user@example.com", entry.Email);
        Assert.Equal("Admin", entry.CreatedBy);
        Assert.Null(entry.Description);
        Assert.True(entry.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Should_SetAndTrimDescription_WhenProvided()
    {
        var entry = new WhitelistEntry("user@example.com", "Admin", "  Amigo do trabalho  ");

        Assert.Equal("Amigo do trabalho", entry.Description);
    }

    [Fact]
    public void Should_UpdateDescription()
    {
        var entry = new WhitelistEntry("user@example.com", "Admin", "Inicial");
        entry.UpdateDescription("  Novo nome  ");

        Assert.Equal("Novo nome", entry.Description);

        entry.UpdateDescription(null);
        Assert.Null(entry.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenEmailIsInvalid(string? email)
    {
        var act = () => new WhitelistEntry(email!, "Admin");

        Assert.Throws<ArgumentException>(act);
    }
}
