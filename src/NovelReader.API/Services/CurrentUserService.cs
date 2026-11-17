using System.Security.Claims;
using NovelReader.Application.Interfaces;

namespace NovelReader.API.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var subClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;

                if (Guid.TryParse(subClaim, out var id))
                {
                    return id;
                }

                return null;
            }
        }

        public string? Email =>
            _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
            ?? _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;

        public string? Name =>
            _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value
            ?? _httpContextAccessor.HttpContext?.User?.FindFirst("name")?.Value;

        public bool IsAuthenticated =>
            _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true && UserId.HasValue;
    }
}
