using FluentAssertions;
using FluentValidation;
using Moq;
using NovelReader.Application.DTOs.Genres;
using NovelReader.Application.Services;
using NovelReader.Application.Validators;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Application.Tests.Services
{
    public class GenreServiceTests
    {
        private readonly Mock<IGenreRepository> _genreRepositoryMock;
        private readonly GenreService _genreService;

        public GenreServiceTests()
        {
            _genreRepositoryMock = new Mock<IGenreRepository>();
            var createValidator = new CreateGenreRequestValidator();
            var updateValidator = new UpdateGenreRequestValidator();
            _genreService = new GenreService(_genreRepositoryMock.Object, createValidator, updateValidator);
        }

        [Fact]
        public async Task CreateAsync_WithValidData_ShouldCreateAndReturnGenreResponse()
        {
            var request = new CreateGenreRequest("Fantasia", "Histórias fantásticas");

            var result = await _genreService.CreateAsync(request, CancellationToken.None);

            result.Should().NotBeNull();
            result.Name.Should().Be("Fantasia");
            result.Description.Should().Be("Histórias fantásticas");

            _genreRepositoryMock.Verify(x => x.CreateAsync(It.Is<Genre>(g => g.Name == "Fantasia"), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var request = new CreateGenreRequest("", null);

            var act = async () => await _genreService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
            _genreRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Genre>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task GetByIdAsync_WhenGenreExists_ShouldReturnGenreResponse()
        {
            var genre = EntityFactory.CreateValidGenre();
            _genreRepositoryMock.Setup(x => x.GetByIdAsync(genre.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(genre);

            var result = await _genreService.GetByIdAsync(genre.Id, CancellationToken.None);

            result.Should().NotBeNull();
            result!.Id.Should().Be(genre.Id);
            result.Name.Should().Be(genre.Name);
        }

        [Fact]
        public async Task GetByIdAsync_WhenGenreDoesNotExist_ShouldReturnNull()
        {
            var id = Guid.NewGuid();
            _genreRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Genre?)null);

            var result = await _genreService.GetByIdAsync(id, CancellationToken.None);

            result.Should().BeNull();
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnPagedGenres()
        {
            var genre = EntityFactory.CreateValidGenre();
            var paged = new PagedResult<Genre>(new[] { genre }, 1, 1, 10);

            _genreRepositoryMock.Setup(x => x.GetAllAsync(1, 10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(paged);

            var result = await _genreService.GetAllAsync(1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.TotalCount.Should().Be(1);
            result.Items.Should().HaveCount(1);
            result.Items.First().Name.Should().Be(genre.Name);
        }

        [Fact]
        public async Task UpdateAsync_WithValidData_ShouldUpdateGenre()
        {
            var genre = EntityFactory.CreateValidGenre();
            _genreRepositoryMock.Setup(x => x.GetByIdAsync(genre.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(genre);

            var request = new UpdateGenreRequest("Ação & Aventura", "Gênero atualizado");

            await _genreService.UpdateAsync(genre.Id, request, CancellationToken.None);

            _genreRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Genre>(g => g.Name == "Ação & Aventura"), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WhenGenreDoesNotExist_ShouldThrowKeyNotFoundException()
        {
            var id = Guid.NewGuid();
            _genreRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Genre?)null);

            var request = new UpdateGenreRequest("Name", null);

            var act = async () => await _genreService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task UpdateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var id = Guid.NewGuid();
            var request = new UpdateGenreRequest("", null);

            var act = async () => await _genreService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
        }

        [Fact]
        public async Task DeleteAsync_ShouldCallRepository()
        {
            var id = Guid.NewGuid();

            await _genreService.DeleteAsync(id, CancellationToken.None);

            _genreRepositoryMock.Verify(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
