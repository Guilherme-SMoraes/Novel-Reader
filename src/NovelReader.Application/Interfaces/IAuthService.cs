using NovelReader.Application.DTOs.Auth;

namespace NovelReader.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginWithGoogleAsync(string idToken, CancellationToken cancellationToken);
        Task<UserDto?> GetCurrentUserProfileAsync(CancellationToken cancellationToken);
    }
}
