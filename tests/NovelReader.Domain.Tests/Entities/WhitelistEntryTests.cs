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
        Assert.True(entry.CreatedAt <= DateTime.UtcNow);
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
