using FluentValidation;
using NovelReader.Application.DTOs.Progress;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Interfaces.Repositories;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Application.Services
{
    public class ProgressService : IProgressService
    {
        private readonly IProgressRepository _progressRepository;
        private readonly IWorkRepository _workRepository;
        private readonly IValidator<CreateProgressRequest> _validator;

        public ProgressService(
            IProgressRepository progressRepository,
            IWorkRepository workRepository,
            IValidator<CreateProgressRequest> validator)
        {
            _progressRepository = progressRepository;
            _workRepository = workRepository;
            _validator = validator;
        }

        public async Task<ProgressResponse> CreateAsync(CreateProgressRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var work = await _workRepository.GetByIdAsync(request.WorkId, cancellationToken);
            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {request.WorkId} não encontrada.");
            }

            var format = work.Formats.FirstOrDefault(f => f.WorkType == request.WorkType);
            if (format is null)
            {
                throw new InvalidOperationException($"A obra não possui o formato {request.WorkType}.");
            }

            var stoppedChapter = new WorkChapter(request.StoppedAtChapter.Volume, request.StoppedAtChapter.Chapter);
            var progress = new Progress(request.WorkId, request.WorkType, stoppedChapter, request.ReadingStatus)
            {
                ReadingDescription = request.ReadingDescription,
                ChapterLink = request.ChapterLink
            };

            await _progressRepository.CreateAsync(progress, cancellationToken);

            return ProgressResponse.FromEntity(progress);
        }

        public async Task<PagedResult<ProgressResponse>> GetByWorkIdAsync(Guid workId, WorkType? workType, int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var workExists = await _workRepository.ExistsAsync(workId, cancellationToken);
            if (!workExists)
            {
                throw new KeyNotFoundException($"Obra com ID {workId} não encontrada.");
            }

            var pagedProgress = await _progressRepository.GetByWorkIdAsync(workId, workType, page, pageSize, cancellationToken);
            var items = pagedProgress.Items.Select(ProgressResponse.FromEntity);

            return new PagedResult<ProgressResponse>(items, pagedProgress.TotalCount, pagedProgress.Page, pagedProgress.PageSize);
        }

        public async Task<ProgressResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var progress = await _progressRepository.GetByIdAsync(id, cancellationToken);
            return progress is null ? null : ProgressResponse.FromEntity(progress);
        }

        public async Task UpdateDescriptionAsync(Guid id, UpdateProgressDescriptionRequest request, CancellationToken cancellationToken = default)
        {
            await _progressRepository.UpdateDescriptionAsync(id, request.Description, cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _progressRepository.DeleteAsync(id, cancellationToken);
        }
    }
}
