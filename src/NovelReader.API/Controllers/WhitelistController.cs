using System.Net.Mail;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Whitelist;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class WhitelistController : ControllerBase
    {
        private readonly IWhitelistRepository _whitelistRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public WhitelistController(
            IWhitelistRepository whitelistRepository,
            IUserRepository userRepository,
            ICurrentUserService currentUserService)
        {
            _whitelistRepository = whitelistRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<WhitelistEntryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var entries = await _whitelistRepository.GetAllAsync(cancellationToken);
            var dtos = entries.Select(e => new WhitelistEntryDto(e.Id, e.Email, e.CreatedAt, e.CreatedBy, e.Description));
            return Ok(dtos);
        }

        [HttpPost]
        [ProducesResponseType(typeof(WhitelistEntryDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Add([FromBody] AddWhitelistRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request?.Email))
            {
                return BadRequest(new { message = "O e-mail é obrigatório." });
            }

            var trimmedEmail = request.Email.Trim().ToLowerInvariant();
            if (!MailAddress.TryCreate(trimmedEmail, out var parsedAddress) || parsedAddress.Address != trimmedEmail)
            {
                return BadRequest(new { message = "Formato de e-mail inválido." });
            }

            var existing = await _whitelistRepository.GetByEmailAsync(trimmedEmail, cancellationToken);
            if (existing != null)
            {
                return BadRequest(new { message = "Este e-mail já está autorizado na whitelist." });
            }

            if (request.Description != null && request.Description.Trim().Length > 500)
            {
                return BadRequest(new { message = "A descrição deve ter no máximo 500 caracteres." });
            }

            string creatorEmail = "Admin";
            if (_currentUserService.UserId.HasValue)
            {
                var currentUser = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value, cancellationToken);
                if (currentUser != null && !string.IsNullOrWhiteSpace(currentUser.Email))
                {
                    creatorEmail = currentUser.Email;
                }
            }

            var entry = new WhitelistEntry(trimmedEmail, creatorEmail, request.Description?.Trim());
            await _whitelistRepository.CreateAsync(entry, cancellationToken);

            var dto = new WhitelistEntryDto(entry.Id, entry.Email, entry.CreatedAt, entry.CreatedBy, entry.Description);
            return StatusCode(StatusCodes.Status201Created, dto);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(WhitelistEntryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateWhitelistRequest request, CancellationToken cancellationToken)
        {
            var entry = await _whitelistRepository.GetByIdAsync(id, cancellationToken);
            if (entry == null)
            {
                return NotFound(new { message = "Entrada da whitelist não encontrada." });
            }

            if (request?.Description != null && request.Description.Trim().Length > 500)
            {
                return BadRequest(new { message = "A descrição deve ter no máximo 500 caracteres." });
            }

            entry.UpdateDescription(request?.Description);
            await _whitelistRepository.UpdateAsync(entry, cancellationToken);

            var dto = new WhitelistEntryDto(entry.Id, entry.Email, entry.CreatedAt, entry.CreatedBy, entry.Description);
            return Ok(dto);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var entry = await _whitelistRepository.GetByIdAsync(id, cancellationToken);
            if (entry == null)
            {
                return NotFound(new { message = "Entrada da whitelist não encontrada." });
            }

            if (entry.Email.Equals(NovelReader.Domain.Entities.User.AdminEmail, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Não é permitido remover o e-mail do administrador principal." });
            }

            await _whitelistRepository.DeleteAsync(entry, cancellationToken);
            return NoContent();
        }
    }
}
