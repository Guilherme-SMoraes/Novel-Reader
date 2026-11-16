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
            foreach (var app in character.FirstAppearances)
            {
                _context.CharacterAppearances.Add(app);
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var deleted = await _context.Characters
                .Where(x => x.Id == id)
                .ExecuteDeleteAsync(cancellationToken);

            if (deleted == 0)
            {
                throw new KeyNotFoundException($"Character {id} não encontrado");
            }
        }

        public async Task<Character?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Characters
                .Include(x => x.FirstAppearances)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<PagedResult<Character>> GetByWorkIdAsync(Guid workId, int page, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Characters
                .Include(x => x.FirstAppearances)
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
            var existing = await _context.Characters
                .Include(x => x.FirstAppearances)
                .FirstOrDefaultAsync(x => x.Id == character.Id, cancellationToken);

            if (existing is null)
            {
                throw new KeyNotFoundException($"Character {character.Id} não encontrado");
            }

            existing.Name = character.Name;
            existing.Description = character.Description;
            existing.ImageUrl = character.ImageUrl;
            existing.CharacterType = character.CharacterType;
            existing.SetAlternativeNames(character.AlternativeNames);

            var targetTypes = character.FirstAppearances.Select(a => a.WorkType).ToHashSet();
            var appearancesToRemove = existing.FirstAppearances.Where(a => !targetTypes.Contains(a.WorkType)).ToList();
            foreach (var a in appearancesToRemove)
            {
                existing.FirstAppearances.Remove(a);
                _context.CharacterAppearances.Remove(a);
            }

            foreach (var app in character.FirstAppearances)
            {
                var existingApp = existing.FirstAppearances.FirstOrDefault(a => a.WorkType == app.WorkType);
                if (existingApp != null)
                {
                    existing.FirstAppearances.Remove(existingApp);
                    _context.CharacterAppearances.Remove(existingApp);
                }
                var newApp = new CharacterAppearance(existing.Id, app.WorkType, app.Chapter);
                existing.AddFirstAppearance(newApp);
                _context.CharacterAppearances.Add(newApp);
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
