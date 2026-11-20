using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Persistence.Repositories
{
    public class GenreRepository : IGenreRepository
    {
        private readonly AppDbContext _context;

        public GenreRepository(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }
        public async Task CreateAsync(Genre genre, CancellationToken cancellationToken)
        {
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var genre = await _context.Genres.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (genre is null)
            {
                throw new KeyNotFoundException($"Genre {id} não encontrado");
            }

            var worksWithGenre = await _context.Works
                .Include(w => w.Genres)
                .Where(w => w.Genres.Any(g => g.Id == id))
                .ToListAsync(cancellationToken);

            foreach (var work in worksWithGenre)
            {
                work.RemoveGenre(id);
            }

            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<PagedResult<Genre>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken)
        {
            var query = _context.Genres
                .AsNoTracking();
            
            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
            
            return new PagedResult<Genre>(items, total, page, pageSize);
        }

        public async Task<Genre?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Genres
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task UpdateAsync(Genre genre, CancellationToken cancellationToken)
        {
            var updated = await _context.Genres
                .Where(x => x.Id == genre.Id)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(w => w.Name, genre.Name)
                    .SetProperty(w => w.Description, genre.Description), 
                    cancellationToken);

            if(updated == 0)
            {
                throw new KeyNotFoundException($"Genre {genre.Id} não encontrado");
            }
        }
    }
}