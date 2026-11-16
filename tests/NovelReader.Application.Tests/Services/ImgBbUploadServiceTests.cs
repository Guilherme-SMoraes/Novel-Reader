using System.Net;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using NovelReader.Infrastructure.Services;

namespace NovelReader.Application.Tests.Services
{
    public class ImgBbUploadServiceTests
    {
        private readonly Mock<ILogger<ImgBbUploadService>> _loggerMock = new();

        [Fact]
        public async Task UploadImageAsync_ShouldThrowInvalidOperationException_WhenApiKeyIsMissing()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "ImgBB:ApiKey", "" }
                })
                .Build();

            var httpClient = new HttpClient();
            var service = new ImgBbUploadService(httpClient, config, _loggerMock.Object);

            using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

            var act = () => service.UploadImageAsync(stream, "test.png");

            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*ImgBB API key is not configured*");
        }

        [Fact]
        public async Task UploadImageAsync_ShouldReturnUrl_WhenUploadIsSuccessful()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "ImgBB:ApiKey", "test-api-key" }
                })
                .Build();

            var handlerMock = new Mock<HttpMessageHandler>();
            var responseJson = """
            {
                "data": {
                    "url": "https://i.ibb.co/test/image.png"
                },
                "success": true,
                "status": 200
            }
            """;

            handlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson)
                });

            var httpClient = new HttpClient(handlerMock.Object);
            var service = new ImgBbUploadService(httpClient, config, _loggerMock.Object);

            using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

            var result = await service.UploadImageAsync(stream, "cover.png");

            result.Should().Be("https://i.ibb.co/test/image.png");
        }

        [Fact]
        public async Task UploadImageAsync_ShouldThrowInvalidOperationException_WhenApiReturnsError()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "ImgBB:ApiKey", "invalid-key" }
                })
                .Build();

            var handlerMock = new Mock<HttpMessageHandler>();
            var errorJson = """
            {
                "status_code": 400,
                "error": {
                    "message": "Invalid API key",
                    "code": 100
                },
                "status_txt": "Bad Request"
            }
            """;

            handlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.BadRequest,
                    Content = new StringContent(errorJson)
                });

            var httpClient = new HttpClient(handlerMock.Object);
            var service = new ImgBbUploadService(httpClient, config, _loggerMock.Object);

            using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

            var act = () => service.UploadImageAsync(stream, "cover.png");

            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Invalid API key*");
        }
    }
}
