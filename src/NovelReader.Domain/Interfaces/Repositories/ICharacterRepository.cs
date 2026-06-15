using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;

namespace NovelReader.Domain.Interfaces.Repositories
{
    public interface ICharacterRepository
    {
        Task CreateAsync(Character character, CancellationToken cancellationToken);
        Task UpdateAsync(Character character, CancellationToken cancellationToken);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken);
        Task<PagedResult<Character>> GetByWorkIdAsync(Guid workId, int page, int pageSize, CancellationToken cancellationToken);
        Task<Character?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    }
}