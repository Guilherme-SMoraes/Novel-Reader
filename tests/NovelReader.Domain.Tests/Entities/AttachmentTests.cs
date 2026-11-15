using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Tests.Entities;

public class AttachmentTests
{
    [Fact]
    public void Should_CreateAttachment_WhenDataIsValid()
    {
        var workId = Guid.NewGuid();
        var attachment = new Attachment("Continente Central", "Mapa", workId, "Detalhes do continente", "https://example.com/mapa.png");

        Assert.NotEqual(Guid.Empty, attachment.Id);
        Assert.Equal(workId, attachment.WorkId);
        Assert.Equal("Continente Central", attachment.Title);
        Assert.Equal("Mapa", attachment.Category);
        Assert.Equal("Detalhes do continente", attachment.Content);
        Assert.Equal("https://example.com/mapa.png", attachment.ImageUrl);
        Assert.True(attachment.CreatedAt <= DateTime.UtcNow);
        Assert.Null(attachment.UpdatedAt);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenTitleIsInvalid(string? title)
    {
        var act = () => new Attachment(title!, "Mapa", Guid.NewGuid());
        Assert.Throws<ArgumentException>(act);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_ThrowArgumentException_WhenCategoryIsInvalid(string? category)
    {
        var act = () => new Attachment("Título", category!, Guid.NewGuid());
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_ThrowArgumentException_WhenWorkIdIsEmpty()
    {
        var act = () => new Attachment("Título", "Mapa", Guid.Empty);
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Should_UpdateAttachment_WhenDataIsValid()
    {
        var attachment = new Attachment("Título Antigo", "Mapa", Guid.NewGuid());
        attachment.Update("Novo Título", "Sistema de Poder", "Nova descrição", "https://img.com/img.png");

        Assert.Equal("Novo Título", attachment.Title);
        Assert.Equal("Sistema de Poder", attachment.Category);
        Assert.Equal("Nova descrição", attachment.Content);
        Assert.Equal("https://img.com/img.png", attachment.ImageUrl);
        Assert.NotNull(attachment.UpdatedAt);
    }
}
