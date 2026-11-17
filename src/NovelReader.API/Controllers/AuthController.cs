using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovelReader.Application.DTOs.Auth;
using NovelReader.Application.Interfaces;

namespace NovelReader.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("google")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request?.IdToken))
            {
                return BadRequest(new { message = "O token do Google é obrigatório." });
            }

            try
            {
                var result = await _authService.LoginWithGoogleAsync(request.IdToken, cancellationToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
        {
            var user = await _authService.GetCurrentUserProfileAsync(cancellationToken);
            if (user == null)
            {
                return Unauthorized(new { message = "Usuário não autenticado." });
            }

            return Ok(user);
        }
    }
}
