using FluentValidation;
using NovelReader.Application.DTOs.Characters;
using NovelReader.Application.Interfaces;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;
using NovelReader.Domain.ValueObjects;

namespace NovelReader.Application.Services
{
    public class CharacterService : ICharacterService
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IWorkRepository _workRepository;
        private readonly IValidator<CreateCharacterRequest> _createValidator;
        private readonly IValidator<UpdateCharacterRequest> _updateValidator;

        public CharacterService(
            ICharacterRepository characterRepository,
            IWorkRepository workRepository,
            IValidator<CreateCharacterRequest> createValidator,
            IValidator<UpdateCharacterRequest> updateValidator)
        {
            _characterRepository = characterRepository;
            _workRepository = workRepository;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        public async Task<CharacterResponse> CreateAsync(CreateCharacterRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var work = await _workRepository.GetByIdAsync(request.WorkId, cancellationToken);
            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {request.WorkId} não encontrada.");
            }

            var character = new Character(request.Name, request.CharacterType, request.WorkId)
            {
                Description = request.Description,
                ImageUrl = request.ImageUrl
            };
            character.SetAlternativeNames(request.AlternativeNames);

            var appearances = request.FirstAppearances.Select(a =>
                new CharacterAppearance(character.Id, a.WorkType, new WorkChapter(a.Chapter.Volume, a.Chapter.Chapter)));
            character.SetFirstAppearances(appearances);

            await _characterRepository.CreateAsync(character, cancellationToken);

            return CharacterResponse.FromEntity(character);
        }

        public async Task<PagedResult<CharacterResponse>> GetByWorkIdAsync(Guid workId, int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var work = await _workRepository.GetByIdAsync(workId, cancellationToken);
            if (work is null)
            {
                throw new KeyNotFoundException($"Obra com ID {workId} não encontrada.");
            }

            var pagedCharacters = await _characterRepository.GetByWorkIdAsync(workId, page, pageSize, cancellationToken);
            var items = pagedCharacters.Items.Select(CharacterResponse.FromEntity);

            return new PagedResult<CharacterResponse>(items, pagedCharacters.TotalCount, pagedCharacters.Page, pagedCharacters.PageSize);
        }

        public async Task<CharacterResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var character = await _characterRepository.GetByIdAsync(id, cancellationToken);
            return character is null ? null : CharacterResponse.FromEntity(character);
        }

        public async Task UpdateAsync(Guid id, UpdateCharacterRequest request, CancellationToken cancellationToken = default)
        {
            var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var character = await _characterRepository.GetByIdAsync(id, cancellationToken);
            if (character is null)
            {
                throw new KeyNotFoundException($"Personagem com ID {id} não encontrado.");
            }

            character.Name = request.Name;
            character.Description = request.Description;
            character.ImageUrl = request.ImageUrl;
            character.CharacterType = request.CharacterType;
            character.SetAlternativeNames(request.AlternativeNames);

            var appearances = request.FirstAppearances.Select(a =>
                new CharacterAppearance(character.Id, a.WorkType, new WorkChapter(a.Chapter.Volume, a.Chapter.Chapter)));
            character.SetFirstAppearances(appearances);

            await _characterRepository.UpdateAsync(character, cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _characterRepository.DeleteAsync(id, cancellationToken);
        }
    }
}
