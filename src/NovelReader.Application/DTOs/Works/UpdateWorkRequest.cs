namespace NovelReader.Application.DTOs.Works
{
    public record UpdateWorkRequest(
        string Title,
        string? Description,
        string AggregatorLink,
        string? CoverImageUrl,
        List<UpdateWorkFormatRequest> Formats,
        List<Guid>? GenreIds = null,
        List<string>? AlternativeTitles = null
    );
}
