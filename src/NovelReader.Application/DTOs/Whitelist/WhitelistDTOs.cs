namespace NovelReader.Application.DTOs.Whitelist
{
    public record WhitelistEntryDto(
        Guid Id,
        string Email,
        DateTime CreatedAt,
        string CreatedBy
    );

    public record AddWhitelistRequest(
        string Email
    );
}
