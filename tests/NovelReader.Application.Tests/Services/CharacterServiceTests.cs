using FluentAssertions;
using FluentValidation;
using Moq;
using NovelReader.Application.DTOs.Characters;
using NovelReader.Application.DTOs.Common;
using NovelReader.Application.Services;
using NovelReader.Application.Validators;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Application.Tests.Services
{
    public class CharacterServiceTests
    {
        private readonly Mock<ICharacterRepository> _characterRepositoryMock;
        private readonly Mock<IWorkRepository> _workRepositoryMock;
        private readonly CharacterService _characterService;

        public CharacterServiceTests()
        {
            _characterRepositoryMock = new Mock<ICharacterRepository>();
            _workRepositoryMock = new Mock<IWorkRepository>();
            var createValidator = new CreateCharacterRequestValidator();
            var updateValidator = new UpdateCharacterRequestValidator();
            _characterService = new CharacterService(
                _characterRepositoryMock.Object,
                _workRepositoryMock.Object,
                createValidator,
                updateValidator
            );
        }

        [Fact]
        public async Task CreateAsync_WithValidDataAndExistingWork_ShouldCreateAndReturnCharacterResponse()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.ExistsAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var appearances = new List<CharacterAppearanceDto>
            {
                new(WorkType.WebNovel, new WorkChapterDto(null, 1))
            };

            var request = new CreateCharacterRequest(
                work.Id,
                "Greed",
                "Protagonist of Overgeared",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                CharacterType.Protagonist,
                appearances,
                new List<string> { "Grid", "Pagma's Successor" }
            );

            var result = await _characterService.CreateAsync(request, CancellationToken.None);

            result.Should().NotBeNull();
            result.WorkId.Should().Be(work.Id);
            result.Name.Should().Be("Greed");
            result.ImageUrl.Should().Be(request.ImageUrl);
            result.CharacterType.Should().Be(CharacterType.Protagonist);
            result.FirstAppearances.Should().HaveCount(1);
            result.FirstAppearances.First().Chapter.Chapter.Should().Be(1);
            result.AlternativeNames.Should().Contain("Grid");
            result.AlternativeNames.Should().Contain("Pagma's Successor");

            _characterRepositoryMock.Verify(x => x.CreateAsync(It.Is<Character>(c => c.Name == "Greed" && c.WorkId == work.Id), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WhenWorkDoesNotExist_ShouldThrowKeyNotFoundException()
        {
            var workId = Guid.NewGuid();
            _workRepositoryMock.Setup(x => x.ExistsAsync(workId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var request = new CreateCharacterRequest(
                workId,
                "Greed",
                null,
                null,
                CharacterType.Protagonist,
                new List<CharacterAppearanceDto> { new(WorkType.WebNovel, new WorkChapterDto(null, 1)) }
            );

            var act = async () => await _characterService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
            _characterRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Character>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var request = new CreateCharacterRequest(
                Guid.Empty,
                "",
                null,
                null,
                (CharacterType)999,
                new List<CharacterAppearanceDto>()
            );

            var act = async () => await _characterService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
            _characterRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Character>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task GetByWorkIdAsync_WhenWorkExists_ShouldReturnPagedCharacters()
        {
            var work = EntityFactory.CreateValidWork();
            var character = EntityFactory.CreateValidCharacter(work.Id);
            _workRepositoryMock.Setup(x => x.ExistsAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var pagedResult = new PagedResult<Character>(new List<Character> { character }, 1, 1, 10);
            _characterRepositoryMock.Setup(x => x.GetByWorkIdAsync(work.Id, 1, 10, It.IsAny<CancellationToken>(), It.IsAny<string?>()))
                .ReturnsAsync(pagedResult);

            var result = await _characterService.GetByWorkIdAsync(work.Id, 1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.Items.Should().HaveCount(1);
            result.TotalCount.Should().Be(1);
        }

        [Fact]
        public async Task GetByWorkIdAsync_WhenWorkDoesNotExist_ShouldThrowKeyNotFoundException()
        {
            var workId = Guid.NewGuid();
            _workRepositoryMock.Setup(x => x.ExistsAsync(workId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var act = async () => await _characterService.GetByWorkIdAsync(workId, 1, 10, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task GetByIdAsync_WhenExists_ShouldReturnCharacter()
        {
            var character = EntityFactory.CreateValidCharacter(Guid.NewGuid());
            _characterRepositoryMock.Setup(x => x.GetByIdAsync(character.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var result = await _characterService.GetByIdAsync(character.Id, CancellationToken.None);

            result.Should().NotBeNull();
            result!.Id.Should().Be(character.Id);
            result.Name.Should().Be(character.Name);
        }

        [Fact]
        public async Task GetByIdAsync_WhenDoesNotExist_ShouldReturnNull()
        {
            var id = Guid.NewGuid();
            _characterRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var result = await _characterService.GetByIdAsync(id, CancellationToken.None);

            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateAsync_WithValidData_ShouldUpdateCharacter()
        {
            var character = EntityFactory.CreateValidCharacter(Guid.NewGuid());
            _characterRepositoryMock.Setup(x => x.GetByIdAsync(character.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(character);

            var request = new UpdateCharacterRequest(
                "Shin Youngwoo",
                "Real name of Greed",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                CharacterType.Protagonist,
                new List<CharacterAppearanceDto> { new(WorkType.WebNovel, new WorkChapterDto(null, 1)) },
                new List<string> { "Grid", "God Grid" }
            );

            await _characterService.UpdateAsync(character.Id, request, CancellationToken.None);

            _characterRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Character>(c => c.Name == "Shin Youngwoo" && c.AlternativeNames.Contains("God Grid")), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WhenCharacterDoesNotExist_ShouldThrowKeyNotFoundException()
        {
            var id = Guid.NewGuid();
            _characterRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Character?)null);

            var request = new UpdateCharacterRequest("Name", null, null, CharacterType.Supporting, new List<CharacterAppearanceDto> { new(WorkType.WebNovel, new WorkChapterDto(null, 1)) });

            var act = async () => await _characterService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task UpdateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var id = Guid.NewGuid();
            var request = new UpdateCharacterRequest("", null, null, CharacterType.Supporting, new List<CharacterAppearanceDto>());

            var act = async () => await _characterService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
        }

        [Fact]
        public async Task DeleteAsync_ShouldCallRepository()
        {
            var id = Guid.NewGuid();

            await _characterService.DeleteAsync(id, CancellationToken.None);

            _characterRepositoryMock.Verify(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WithAffiliations_ShouldPersistAndReturnAffiliations()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.ExistsAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var appearances = new List<CharacterAppearanceDto>
            {
                new(WorkType.WebNovel, new WorkChapterDto(null, 1))
            };

            var request = new CreateCharacterRequest(
                work.Id,
                "Klein Moretti",
                "Lord of the Mysteries",
                null,
                CharacterType.Protagonist,
                appearances,
                new List<string> { "The Fool" },
                new List<string> { "Tarot Club", "Nighthawks" }
            );

            var result = await _characterService.CreateAsync(request, CancellationToken.None);

            result.Should().NotBeNull();
            result.Affiliations.Should().Contain(new[] { "Tarot Club", "Nighthawks" });
            _characterRepositoryMock.Verify(x => x.CreateAsync(It.Is<Character>(c => c.Affiliations.Count == 2), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
