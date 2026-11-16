using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Images;
using NovelReader.Application.Interfaces;

namespace NovelReader.API.Controllers
{
    [ApiController]
    [Route("api/images")]
    public class ImagesController : ControllerBase
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"
        };

        private const long MaxFileSizeBytes = 32 * 1024 * 1024;

        private readonly IImageUploadService _imageUploadService;

        public ImagesController(IImageUploadService imageUploadService)
        {
            _imageUploadService = imageUploadService;
        }

        [HttpPost("upload")]
        [ProducesResponseType(typeof(ImageUploadResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Upload(IFormFile? file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file was uploaded." });
            }

            if (file.Length > MaxFileSizeBytes)
            {
                return BadRequest(new { message = "File size exceeds the maximum limit of 32MB." });
            }

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Unsupported image format. Allowed formats are: JPG, PNG, GIF, WEBP, BMP." });
            }

            await using var stream = file.OpenReadStream();
            var imageUrl = await _imageUploadService.UploadImageAsync(stream, file.FileName, cancellationToken);

            return Ok(new ImageUploadResponse(imageUrl));
        }
    }
}
