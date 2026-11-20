namespace NovelReader.Application.DTOs.Auth
{
    public record GoogleLoginRequest(string IdToken);

    public record AuthResponse(
        string Token,
        Guid UserId,
        string Email,
        string Name,
        string? AvatarUrl,
        string Role
    );

    public record UserDto(
        Guid Id,
        string Email,
        string Name,
        string? AvatarUrl,
        string Role
    );
}
