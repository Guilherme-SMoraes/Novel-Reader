namespace NovelReader.Application.DTOs.Whitelist
{
    public record WhitelistEntryDto(
        Guid Id,
        string Email,
        DateTime CreatedAt,
        string CreatedBy,
        string? Description
    );

    public record AddWhitelistRequest(
        string Email,
        string? Description
    );

    public record UpdateWhitelistRequest(
        string? Description
    );
}
