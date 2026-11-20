using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NovelReader.Application.DTOs.Images;
using NovelReader.Application.Interfaces;

namespace NovelReader.API.Controllers
{
    [Authorize]
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
        [EnableRateLimiting("images-policy")]
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

            if (!IsValidImageHeader(stream))
            {
                return BadRequest(new { message = "The uploaded file is not a valid image or is corrupted." });
            }

            var imageUrl = await _imageUploadService.UploadImageAsync(stream, file.FileName, cancellationToken);

            return Ok(new ImageUploadResponse(imageUrl));
        }

        private static bool IsValidImageHeader(Stream stream)
        {
            if (stream.Length < 12) return false;
            Span<byte> header = stackalloc byte[12];
            var bytesRead = stream.Read(header);
            stream.Position = 0;
            if (bytesRead < 12) return false;

            // JPEG (FF D8 FF)
            if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return true;

            // PNG (89 50 4E 47 0D 0A 1A 0A)
            if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 &&
                header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A) return true;

            // GIF (47 49 46 38)
            if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38) return true;

            // BMP (42 4D)
            if (header[0] == 0x42 && header[1] == 0x4D) return true;

            // WebP (RIFF .... WEBP)
            if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) return true;

            return false;
        }
    }
}
