using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Works
{
    public record CreateWorkRequest(
        string Title,
        string? Description,
        string AggregatorLink,
        string? CoverImageUrl,
        Language OriginalLanguage,
        List<CreateWorkFormatRequest> Formats,
        List<Guid>? GenreIds = null,
        List<string>? AlternativeTitles = null
    );
}
