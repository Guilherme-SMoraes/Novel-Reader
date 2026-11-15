using FluentValidation;
using NovelReader.Application.DTOs.Attachments;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Application.Services
{
    public class AttachmentService : IAttachmentService
    {
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IWorkRepository _workRepository;
        private readonly IValidator<CreateAttachmentRequest> _createValidator;
        private readonly IValidator<UpdateAttachmentRequest> _updateValidator;

        public AttachmentService(
            IAttachmentRepository attachmentRepository,
            IWorkRepository workRepository,
            IValidator<CreateAttachmentRequest> createValidator,
            IValidator<UpdateAttachmentRequest> updateValidator)
        {
            _attachmentRepository = attachmentRepository;
            _workRepository = workRepository;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        public async Task<AttachmentResponse> CreateAsync(Guid workId, CreateAttachmentRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var work = await _workRepository.GetByIdAsync(workId, cancellationToken);
            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {workId} não encontrada.");
            }

            var attachment = new Attachment(request.Title, request.Category, workId, request.Content, request.ImageUrl);
            await _attachmentRepository.AddAsync(attachment, cancellationToken);

            return AttachmentResponse.FromEntity(attachment);
        }

        public async Task<IReadOnlyList<AttachmentResponse>> GetByWorkIdAsync(Guid workId, CancellationToken cancellationToken = default)
        {
            var work = await _workRepository.GetByIdAsync(workId, cancellationToken);
            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {workId} não encontrada.");
            }

            var attachments = await _attachmentRepository.GetByWorkIdAsync(workId, cancellationToken);
            return attachments.Select(AttachmentResponse.FromEntity).ToList();
        }

        public async Task<AttachmentResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var attachment = await _attachmentRepository.GetByIdAsync(id, cancellationToken);
            return attachment is null ? null : AttachmentResponse.FromEntity(attachment);
        }

        public async Task<AttachmentResponse> UpdateAsync(Guid id, UpdateAttachmentRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var attachment = await _attachmentRepository.GetByIdAsync(id, cancellationToken);
            if (attachment is null)
            {
                throw new KeyNotFoundException($"Anexo com ID {id} não encontrado.");
            }

            attachment.Update(request.Title, request.Category, request.Content, request.ImageUrl);
            await _attachmentRepository.UpdateAsync(attachment, cancellationToken);

            return AttachmentResponse.FromEntity(attachment);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var attachment = await _attachmentRepository.GetByIdAsync(id, cancellationToken);
            if (attachment is null)
            {
                throw new KeyNotFoundException($"Anexo com ID {id} não encontrado.");
            }

            await _attachmentRepository.DeleteAsync(id, cancellationToken);
        }
    }
}
