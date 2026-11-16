using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NovelReader.Application.Interfaces;

namespace NovelReader.Infrastructure.Services
{
    public class ImgBbUploadService : IImageUploadService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ImgBbUploadService> _logger;

        public ImgBbUploadService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<ImgBbUploadService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> UploadImageAsync(Stream imageStream, string fileName, CancellationToken cancellationToken = default)
        {
            var apiKey = _configuration["ImgBB:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("ImgBB API key is not configured. Please configure IMGBB_API_KEY in the environment or .env file.");
            }

            using var content = new MultipartFormDataContent();
            using var streamContent = new StreamContent(imageStream);
            content.Add(streamContent, "image", fileName);

            var endpoint = $"https://api.imgbb.com/1/upload?key={Uri.EscapeDataString(apiKey)}";
            
            HttpResponseMessage response;
            try
            {
                response = await _httpClient.PostAsync(endpoint, content, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Failed to connect to ImgBB service.");
                throw new InvalidOperationException("Unable to contact ImgBB image service. Please check your network connection.", ex);
            }

            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("ImgBB upload failed with status code {StatusCode}. Body: {Body}", response.StatusCode, responseBody);
                var errorDetail = TryExtractErrorMessage(responseBody) ?? $"Upload failed with HTTP status {(int)response.StatusCode}.";
                throw new InvalidOperationException($"ImgBB error: {errorDetail}");
            }

            using var doc = JsonDocument.Parse(responseBody);
            if (doc.RootElement.TryGetProperty("data", out var dataElem) &&
                dataElem.TryGetProperty("url", out var urlElem))
            {
                var url = urlElem.GetString();
                if (!string.IsNullOrWhiteSpace(url))
                {
                    return url;
                }
            }

            throw new InvalidOperationException("ImgBB returned a success status but the image URL was not found in the response.");
        }

        private static string? TryExtractErrorMessage(string json)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("error", out var errorElem) &&
                    errorElem.TryGetProperty("message", out var msgElem))
                {
                    return msgElem.GetString();
                }
            }
            catch
            {
                return null;
            }

            return null;
        }
    }
}
