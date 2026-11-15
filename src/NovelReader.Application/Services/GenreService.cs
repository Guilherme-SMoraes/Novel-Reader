using FluentValidation;
using NovelReader.Application.DTOs.Genres;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Application.Services
{
    public class GenreService : IGenreService
    {
        private readonly IGenreRepository _genreRepository;
        private readonly IValidator<CreateGenreRequest> _createValidator;
        private readonly IValidator<UpdateGenreRequest> _updateValidator;

        public GenreService(
            IGenreRepository genreRepository,
            IValidator<CreateGenreRequest> createValidator,
            IValidator<UpdateGenreRequest> updateValidator)
        {
            _genreRepository = genreRepository;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        public async Task<GenreResponse> CreateAsync(CreateGenreRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var genre = new Genre(request.Name)
            {
                Description = request.Description
            };

            await _genreRepository.CreateAsync(genre, cancellationToken);

            return GenreResponse.FromEntity(genre);
        }

        public async Task<GenreResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var genre = await _genreRepository.GetByIdAsync(id, cancellationToken);
            return genre is null ? null : GenreResponse.FromEntity(genre);
        }

        public async Task<PagedResult<GenreResponse>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var pagedGenres = await _genreRepository.GetAllAsync(page, pageSize, cancellationToken);
            var items = pagedGenres.Items.Select(GenreResponse.FromEntity);

            return new PagedResult<GenreResponse>(items, pagedGenres.TotalCount, pagedGenres.Page, pagedGenres.PageSize);
        }

        public async Task UpdateAsync(Guid id, UpdateGenreRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var genre = await _genreRepository.GetByIdAsync(id, cancellationToken);
            if (genre is null)
            {
                throw new KeyNotFoundException($"Gênero com ID {id} não encontrado.");
            }

            genre.Name = request.Name;
            genre.Description = request.Description;

            await _genreRepository.UpdateAsync(genre, cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _genreRepository.DeleteAsync(id, cancellationToken);
        }
    }
}
