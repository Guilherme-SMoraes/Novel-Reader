using NovelReader.Application.DTOs.Common;
using NovelReader.Application.DTOs.Genres;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;

namespace NovelReader.Application.DTOs.Works
{
    public record WorkResponse(
        Guid Id,
        string Title,
        string? Description,
        string AggregatorLink,
        string? CoverImageUrl,
        Language OriginalLanguage,
        IReadOnlyList<WorkFormatDto> Formats,
        IReadOnlyList<GenreResponse> Genres
    )
    {
        public static WorkResponse FromEntity(Work work) =>
            new(
                work.Id,
                work.Title,
                work.Description,
                work.AggregatorLink,
                work.CoverImageUrl,
                work.OriginalLanguage,
                work.Formats?.Select(WorkFormatDto.FromEntity).ToList() ?? new List<WorkFormatDto>(),
                work.Genres?.Select(GenreResponse.FromEntity).ToList() ?? new List<GenreResponse>()
            );
    }
}
