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

            var work = new Work(
                request.Title,
                request.AggregatorLink,
                request.OriginalLanguage
            )
            {
                Description = request.Description,
                CoverImageUrl = request.CoverImageUrl
            };
            work.SetAlternativeTitles(request.AlternativeTitles);

            foreach (var formatReq in request.Formats)
            {
                var totalChapter = new WorkChapter(formatReq.TotalChapter.Volume, formatReq.TotalChapter.Chapter);
                var format = new WorkFormat(work.Id, formatReq.WorkType, totalChapter, formatReq.LinkWhereToRead);
                if (formatReq.TranslatedUpTo != null && formatReq.TranslatedLanguage.HasValue)
                {
                    var translatedChapter = new WorkChapter(formatReq.TranslatedUpTo.Volume, formatReq.TranslatedUpTo.Chapter);
                    format.UpdateTranslatedChapters(translatedChapter, formatReq.TranslatedLanguage.Value);
                }
                work.AddFormat(format);
            }

            await _workRepository.CreateAsync(work, cancellationToken, request.GenreIds);

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

            var updatedWork = new Work(
                id,
                request.Title,
                request.AggregatorLink,
                work.OriginalLanguage
            )
            {
                Description = request.Description,
                CoverImageUrl = request.CoverImageUrl
            };
            updatedWork.SetAlternativeTitles(request.AlternativeTitles);

            foreach (var formatReq in request.Formats)
            {
                var totalChapter = new WorkChapter(formatReq.TotalChapter.Volume, formatReq.TotalChapter.Chapter);
                var format = new WorkFormat(id, formatReq.WorkType, totalChapter, formatReq.LinkWhereToRead);
                if (formatReq.TranslatedUpTo != null && formatReq.TranslatedLanguage.HasValue)
                {
                    var translatedChapter = new WorkChapter(formatReq.TranslatedUpTo.Volume, formatReq.TranslatedUpTo.Chapter);
                    format.UpdateTranslatedChapters(translatedChapter, formatReq.TranslatedLanguage.Value);
                }
                updatedWork.AddFormat(format);
            }

            await _workRepository.UpdateAsync(updatedWork, cancellationToken, request.GenreIds);
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
