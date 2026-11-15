using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Characters;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;

namespace NovelReader.API.Controllers
{
    [ApiController]
    [Route("api/works/{workId:guid}/characters")]
    public class CharactersController : ControllerBase
    {
        private readonly ICharacterService _characterService;

        public CharactersController(ICharacterService characterService)
        {
            _characterService = characterService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create(
            [FromRoute] Guid workId,
            [FromBody] CreateCharacterRequest request,
            CancellationToken cancellationToken)
        {
            var requestWithWorkId = request with { WorkId = workId };
            var result = await _characterService.CreateAsync(requestWithWorkId, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<CharacterResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByWorkId(
            [FromRoute] Guid workId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var result = await _characterService.GetByWorkIdAsync(workId, page, pageSize, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CharacterResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(
            [FromRoute] Guid workId,
            [FromRoute] Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _characterService.GetByIdAsync(id, cancellationToken);
            if (result is null || result.WorkId != workId)
            {
                return NotFound(new { message = $"Personagem com ID {id} não encontrado para a obra especificada." });
            }

            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(
            [FromRoute] Guid workId,
            [FromRoute] Guid id,
            [FromBody] UpdateCharacterRequest request,
            CancellationToken cancellationToken)
        {
            var existing = await _characterService.GetByIdAsync(id, cancellationToken);
            if (existing is null || existing.WorkId != workId)
            {
                return NotFound(new { message = $"Personagem com ID {id} não encontrado para a obra especificada." });
            }

            await _characterService.UpdateAsync(id, request, cancellationToken);
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
            var existing = await _characterService.GetByIdAsync(id, cancellationToken);
            if (existing is null || existing.WorkId != workId)
            {
                return NotFound(new { message = $"Personagem com ID {id} não encontrado para a obra especificada." });
            }

            await _characterService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}
