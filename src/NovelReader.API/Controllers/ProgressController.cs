using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Progress;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;

namespace NovelReader.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/works/{workId:guid}/progress")]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _progressService;

        public ProgressController(IProgressService progressService)
        {
            _progressService = progressService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(ProgressResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create(
            [FromRoute] Guid workId,
            [FromBody] CreateProgressRequest request,
            CancellationToken cancellationToken)
        {
            var requestWithWorkId = request with { WorkId = workId };
            var result = await _progressService.CreateAsync(requestWithWorkId, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<ProgressResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByWorkId(
            [FromRoute] Guid workId,
            [FromQuery] NovelReader.Domain.Enums.WorkType? workType = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var result = await _progressService.GetByWorkIdAsync(workId, workType, page, pageSize, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ProgressResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(
            [FromRoute] Guid workId,
            [FromRoute] Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _progressService.GetByIdAsync(id, cancellationToken);
            if (result is null || result.WorkId != workId)
            {
                return NotFound(new { message = $"Progresso com ID {id} não encontrado para a obra especificada." });
            }

            return Ok(result);
        }

        [HttpPatch("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDescription(
            [FromRoute] Guid workId,
            [FromRoute] Guid id,
            [FromBody] UpdateProgressDescriptionRequest request,
            CancellationToken cancellationToken)
        {
            var existing = await _progressService.GetByIdAsync(id, cancellationToken);
            if (existing is null || existing.WorkId != workId)
            {
                return NotFound(new { message = $"Progresso com ID {id} não encontrado para a obra especificada." });
            }

            await _progressService.UpdateDescriptionAsync(id, request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(
            [FromRoute] Guid workId,
            [FromRoute] Guid id,
            CancellationToken cancellationToken)
        {
            var existing = await _progressService.GetByIdAsync(id, cancellationToken);
            if (existing is null || existing.WorkId != workId)
            {
                return NotFound(new { message = $"Progresso com ID {id} não encontrado para a obra especificada." });
            }

            await _progressService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}
