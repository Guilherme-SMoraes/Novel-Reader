using NovelReader.Application.DTOs.Characters;
using NovelReader.Domain.Common;

namespace NovelReader.Application.Interfaces
{
    public interface ICharacterService
    {
        Task<CharacterResponse> CreateAsync(CreateCharacterRequest request, CancellationToken cancellationToken = default);
        Task<PagedResult<CharacterResponse>> GetByWorkIdAsync(Guid workId, int page, int pageSize, CancellationToken cancellationToken = default);
        Task<CharacterResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task UpdateAsync(Guid id, UpdateCharacterRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
