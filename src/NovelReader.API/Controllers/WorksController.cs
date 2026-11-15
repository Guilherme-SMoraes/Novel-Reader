using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Works;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;

namespace NovelReader.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorksController : ControllerBase
    {
        private readonly IWorkService _workService;

        public WorksController(IWorkService workService)
        {
            _workService = workService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(WorkResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateWorkRequest request, CancellationToken cancellationToken)
        {
            var result = await _workService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(WorkResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var result = await _workService.GetByIdAsync(id, cancellationToken);
            if (result is null)
            {
                return NotFound(new { message = $"Obra com ID {id} não encontrada." });
            }

            return Ok(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<WorkResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var result = await _workService.GetAllAsync(page, pageSize, cancellationToken);
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateWorkRequest request, CancellationToken cancellationToken)
        {
            await _workService.UpdateAsync(id, request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            await _workService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }

        [HttpGet("search")]
        [ProducesResponseType(typeof(PagedResult<WorkResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Search([FromQuery] string name, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var result = await _workService.FindByNameAsync(name, page, pageSize, cancellationToken);
            return Ok(result);
        }

        [HttpGet("by-genre/{genreId:guid}")]
        [ProducesResponseType(typeof(PagedResult<WorkResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListByGenre([FromRoute] Guid genreId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var result = await _workService.ListByGenreAsync(genreId, page, pageSize, cancellationToken);
            return Ok(result);
        }
    }
}
