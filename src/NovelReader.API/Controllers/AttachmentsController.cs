using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Attachments;
using NovelReader.Application.Interfaces;

namespace NovelReader.API.Controllers
{
    [ApiController]
    public class AttachmentsController : ControllerBase
    {
        private readonly IAttachmentService _attachmentService;

        public AttachmentsController(IAttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
        }

        [HttpPost("api/works/{workId:guid}/attachments")]
        [ProducesResponseType(typeof(AttachmentResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create(
            [FromRoute] Guid workId,
            [FromBody] CreateAttachmentRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _attachmentService.CreateAsync(workId, request, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpGet("api/works/{workId:guid}/attachments")]
        [ProducesResponseType(typeof(IReadOnlyList<AttachmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByWorkId(
            [FromRoute] Guid workId,
            CancellationToken cancellationToken)
        {
            var result = await _attachmentService.GetByWorkIdAsync(workId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("api/attachments/{id:guid}")]
        [ProducesResponseType(typeof(AttachmentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(
            [FromRoute] Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _attachmentService.GetByIdAsync(id, cancellationToken);
            if (result is null)
            {
                return NotFound(new { message = $"Anexo com ID {id} não encontrado." });
            }

            return Ok(result);
        }

        [HttpPut("api/attachments/{id:guid}")]
        [ProducesResponseType(typeof(AttachmentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(
            [FromRoute] Guid id,
            [FromBody] UpdateAttachmentRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _attachmentService.UpdateAsync(id, request, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("api/attachments/{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(
            [FromRoute] Guid id,
            CancellationToken cancellationToken)
        {
            await _attachmentService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}
