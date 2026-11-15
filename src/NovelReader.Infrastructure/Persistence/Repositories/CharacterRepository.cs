using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Persistence.Repositories
{
    public class CharacterRepository : ICharacterRepository
    {
        private readonly AppDbContext _context;
        public CharacterRepository(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }
        public async Task CreateAsync(Character character, CancellationToken cancellationToken)
        {
            _context.Characters.Add(character);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _context.Characters
                .Where(x => x.Id == id)
                .ExecuteDeleteAsync(cancellationToken);

            if(deleted == 0)
            {
                throw new KeyNotFoundException($"Character {id} não encontrado");
            }
        }

        public async Task<Character?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Characters
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<PagedResult<Character>> GetByWorkIdAsync(Guid workId, int page, int pageSize, CancellationToken cancellationToken)
        {
            var query =  _context.Characters
                .AsNoTracking()
                .Where(x => x.WorkId == workId)
                .OrderBy(x => x.Name);
            
            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
            
            return new PagedResult<Character>(items, total, page, pageSize);
        }

        public async Task UpdateAsync(Character character, CancellationToken cancellationToken)
        {
            var updated = await _context.Characters
                .Where(x => x.Id == character.Id)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(w => w.Name, character.Name)
                    .SetProperty(w => w.Description, character.Description)
                    .SetProperty(w => w.ImageUrl, character.ImageUrl)
                    .SetProperty(w => w.CharacterType, character.CharacterType), 
                    cancellationToken);

            if(updated == 0)
            {
                throw new KeyNotFoundException($"Character {character.Id} não encontrado");
            }
        }
    }
}