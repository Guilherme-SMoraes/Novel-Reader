using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void Should_CreateUser_WithDefaultUserRole_WhenNotAdminEmail()
    {
        var user = new User("google-123", "normaluser@gmail.com", "Normal User");

        Assert.NotEqual(Guid.Empty, user.Id);
        Assert.Equal("normaluser@gmail.com", user.Email);
        Assert.Equal("User", user.Role);
    }

    [Fact]
    public void Should_CreateUser_WithAdminRole_WhenEmailIsAdminEmail()
    {
        var user = new User("google-admin", "guisanmo1@gmail.com", "Admin User");

        Assert.Equal("guisanmo1@gmail.com", user.Email);
        Assert.Equal("Admin", user.Role);
    }

    [Fact]
    public void Should_PromoteToAdmin_WhenUpdateProfileWithAdminEmail()
    {
        var user = new User("google-123", "guisanmo1@gmail.com", "Name", role: "User");
        Assert.Equal("User", user.Role);

        user.UpdateProfile("New Name", null);

        Assert.Equal("Admin", user.Role);
    }
}
