using FluentValidation;
using NovelReader.Application.DTOs.Works;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Interfaces.Repositories;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Application.Services
{
    public class WorkService : IWorkService
    {
        private readonly IWorkRepository _workRepository;
        private readonly IValidator<CreateWorkRequest> _createValidator;
        private readonly IValidator<UpdateWorkRequest> _updateValidator;

        public WorkService(
            IWorkRepository workRepository,
            IValidator<CreateWorkRequest> createValidator,
            IValidator<UpdateWorkRequest> updateValidator)
        {
            _workRepository = workRepository;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        public async Task<WorkResponse> CreateAsync(CreateWorkRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var totalChapter = new WorkChapter(request.TotalChapter.Volume, request.TotalChapter.Chapter);
            var work = new Work(
                request.Title,
                request.WorkType,
                request.AggregatorLink,
                totalChapter,
                request.OriginalLanguage
            )
            {
                Description = request.Description,
                LinkWhereToRead = request.LinkWhereToRead,
                CoverImageUrl = request.CoverImageUrl
            };

            await _workRepository.CreateAsync(work, cancellationToken);

            return WorkResponse.FromEntity(work);
        }

        public async Task<WorkResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var work = await _workRepository.GetByIdAsync(id, cancellationToken);
            return work is null ? null : WorkResponse.FromEntity(work);
        }

        public async Task<PagedResult<WorkResponse>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            return await GetAllAsync(null, null, null, null, page, pageSize, cancellationToken);
        }

        public async Task<PagedResult<WorkResponse>> GetAllAsync(
            string? title,
            WorkType? workType,
            Guid? genreId,
            ReadingStatus? readingStatus,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            var pagedWorks = await _workRepository.GetAllAsync(title, workType, genreId, readingStatus, page, pageSize, cancellationToken);
            var items = pagedWorks.Items.Select(WorkResponse.FromEntity);

            return new PagedResult<WorkResponse>(items, pagedWorks.TotalCount, pagedWorks.Page, pagedWorks.PageSize);
        }

        public async Task UpdateAsync(Guid id, UpdateWorkRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var work = await _workRepository.GetByIdAsync(id, cancellationToken);
            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {id} não encontrada.");
            }

            work.Title = request.Title;
            work.Description = request.Description;
            work.AggregatorLink = request.AggregatorLink;
            work.LinkWhereToRead = request.LinkWhereToRead;
            work.CoverImageUrl = request.CoverImageUrl;

            var totalChapter = new WorkChapter(request.TotalChapter.Volume, request.TotalChapter.Chapter);

            if (request.TranslatedUpTo != null && request.TranslatedLanguage.HasValue)
            {
                var translatedChapter = new WorkChapter(request.TranslatedUpTo.Volume, request.TranslatedUpTo.Chapter);
                work.UpdateTotalChapters(totalChapter);
                work.UpdateTranslatedChapters(translatedChapter, request.TranslatedLanguage.Value);
            }
            else
            {
                work.UpdateTotalChapters(totalChapter);
            }

            await _workRepository.UpdateAsync(work, cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _workRepository.DeleteAsync(id, cancellationToken);
        }

        public async Task<PagedResult<WorkResponse>> FindByNameAsync(string name, int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var pagedWorks = await _workRepository.FindByNameAsync(name, page, pageSize, cancellationToken);
            var items = pagedWorks.Items.Select(WorkResponse.FromEntity);

            return new PagedResult<WorkResponse>(items, pagedWorks.TotalCount, pagedWorks.Page, pagedWorks.PageSize);
        }

        public async Task<PagedResult<WorkResponse>> ListByGenreAsync(Guid genreId, int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var pagedWorks = await _workRepository.ListByGenreAsync(genreId, page, pageSize, cancellationToken);
            var items = pagedWorks.Items.Select(WorkResponse.FromEntity);

            return new PagedResult<WorkResponse>(items, pagedWorks.TotalCount, pagedWorks.Page, pagedWorks.PageSize);
        }

        public async Task AddGenreAsync(Guid workId, Guid genreId, CancellationToken cancellationToken = default)
        {
            await _workRepository.AddGenreAsync(workId, genreId, cancellationToken);
        }

        public async Task RemoveGenreAsync(Guid workId, Guid genreId, CancellationToken cancellationToken = default)
        {
            await _workRepository.RemoveGenreAsync(workId, genreId, cancellationToken);
        }
    }
}
