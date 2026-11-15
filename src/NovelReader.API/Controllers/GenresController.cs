using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Genres;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;

namespace NovelReader.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenresController : ControllerBase
    {
        private readonly IGenreService _genreService;

        public GenresController(IGenreService genreService)
        {
            _genreService = genreService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(GenreResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateGenreRequest request, CancellationToken cancellationToken)
        {
            var result = await _genreService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(GenreResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var result = await _genreService.GetByIdAsync(id, cancellationToken);
            if (result is null)
            {
                return NotFound(new { message = $"Gênero com ID {id} não encontrado." });
            }

            return Ok(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<GenreResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var result = await _genreService.GetAllAsync(page, pageSize, cancellationToken);
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateGenreRequest request, CancellationToken cancellationToken)
        {
            await _genreService.UpdateAsync(id, request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            await _genreService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}
