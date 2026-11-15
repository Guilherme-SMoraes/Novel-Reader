using Microsoft.EntityFrameworkCore;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Infrastructure.Persistence.Repositories
{
    public class AttachmentRepository : IAttachmentRepository
    {
        private readonly AppDbContext _context;

        public AttachmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Attachment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Attachments
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<IReadOnlyList<Attachment>> GetByWorkIdAsync(Guid workId, CancellationToken cancellationToken = default)
        {
            return await _context.Attachments
                .AsNoTracking()
                .Where(x => x.WorkId == workId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task AddAsync(Attachment attachment, CancellationToken cancellationToken = default)
        {
            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(Attachment attachment, CancellationToken cancellationToken = default)
        {
            _context.Attachments.Update(attachment);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var deleted = await _context.Attachments
                .Where(x => x.Id == id)
                .ExecuteDeleteAsync(cancellationToken);

            if (deleted == 0)
            {
                throw new KeyNotFoundException($"Attachment {id} não encontrado");
            }
        }
    }
}
