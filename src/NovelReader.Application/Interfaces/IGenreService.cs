using NovelReader.Application.DTOs.Genres;
using NovelReader.Domain.Common;

namespace NovelReader.Application.Interfaces
{
    public interface IGenreService
    {
        Task<GenreResponse> CreateAsync(CreateGenreRequest request, CancellationToken cancellationToken = default);
        Task<GenreResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<PagedResult<GenreResponse>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default);
        Task UpdateAsync(Guid id, UpdateGenreRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
