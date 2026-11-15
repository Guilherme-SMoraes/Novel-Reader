using FluentAssertions;
using FluentValidation;
using Moq;
using NovelReader.Application.DTOs.Common;
using NovelReader.Application.DTOs.Works;
using NovelReader.Application.Services;
using NovelReader.Application.Validators;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Application.Tests.Services
{
    public class WorkServiceTests
    {
        private readonly Mock<IWorkRepository> _workRepositoryMock;
        private readonly WorkService _workService;

        public WorkServiceTests()
        {
            _workRepositoryMock = new Mock<IWorkRepository>();
            var createValidator = new CreateWorkRequestValidator();
            var updateValidator = new UpdateWorkRequestValidator();
            _workService = new WorkService(_workRepositoryMock.Object, createValidator, updateValidator);
        }

        [Fact]
        public async Task CreateAsync_WithValidData_ShouldCreateAndReturnWorkResponse()
        {
            var request = new CreateWorkRequest(
                "Solo Leveling",
                "Hunter Sung Jinwoo story",
                WorkType.WebNovel,
                "https://novelupdates.com/series/solo-leveling",
                "https://readlightnovel.me",
                "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f",
                new WorkChapterDto(null, 270),
                Language.Korean
            );

            var result = await _workService.CreateAsync(request, CancellationToken.None);

            result.Should().NotBeNull();
            result.Title.Should().Be(request.Title);
            result.Description.Should().Be(request.Description);
            result.WorkType.Should().Be(request.WorkType);
            result.AggregatorLink.Should().Be(request.AggregatorLink);
            result.LinkWhereToRead.Should().Be(request.LinkWhereToRead);
            result.CoverImageUrl.Should().Be(request.CoverImageUrl);
            result.TotalChapter.Chapter.Should().Be(270);
            result.OriginalLanguage.Should().Be(Language.Korean);

            _workRepositoryMock.Verify(x => x.CreateAsync(It.Is<Work>(w => w.Title == request.Title), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var request = new CreateWorkRequest(
                "",
                null,
                WorkType.WebNovel,
                "",
                null,
                null,
                new WorkChapterDto(null, 0),
                Language.Korean
            );

            var act = async () => await _workService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
            _workRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Work>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task GetByIdAsync_WhenWorkExists_ShouldReturnWorkResponse()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(work);

            var result = await _workService.GetByIdAsync(work.Id, CancellationToken.None);

            result.Should().NotBeNull();
            result!.Id.Should().Be(work.Id);
            result.Title.Should().Be(work.Title);
        }

        [Fact]
        public async Task GetByIdAsync_WhenWorkDoesNotExist_ShouldReturnNull()
        {
            var id = Guid.NewGuid();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Work?)null);

            var result = await _workService.GetByIdAsync(id, CancellationToken.None);

            result.Should().BeNull();
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnPagedWorks()
        {
            var work = EntityFactory.CreateValidWork();
            var paged = new PagedResult<Work>(new[] { work }, 1, 1, 10);

            _workRepositoryMock.Setup(x => x.GetAllAsync(null, null, null, null, 1, 10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(paged);

            var result = await _workService.GetAllAsync(1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.TotalCount.Should().Be(1);
            result.Items.Should().HaveCount(1);
            result.Items.First().Title.Should().Be(work.Title);
        }

        [Fact]
        public async Task GetAllAsync_WithFilters_ShouldReturnFilteredPagedWorks()
        {
            var work = EntityFactory.CreateValidWork();
            var paged = new PagedResult<Work>(new[] { work }, 1, 1, 10);

            _workRepositoryMock.Setup(x => x.GetAllAsync("Overgeared", WorkType.WebNovel, null, ReadingStatus.Reading, 1, 10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(paged);

            var result = await _workService.GetAllAsync("Overgeared", WorkType.WebNovel, null, ReadingStatus.Reading, 1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.TotalCount.Should().Be(1);
            result.Items.First().Title.Should().Be(work.Title);
        }

        [Fact]
        public async Task UpdateAsync_WithValidData_ShouldUpdateWork()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(work);

            var request = new UpdateWorkRequest(
                "Overgeared Updated",
                "New description",
                "https://novelupdates.com/series/overgeared-new",
                "https://wuxiaworld.com",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477",
                new WorkChapterDto(null, 2100),
                new WorkChapterDto(null, 1800),
                Language.English
            );

            await _workService.UpdateAsync(work.Id, request, CancellationToken.None);

            _workRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Work>(w => w.Title == "Overgeared Updated" && w.TotalChapter.Chapter == 2100), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WhenWorkDoesNotExist_ShouldThrowKeyNotFoundException()
        {
            var id = Guid.NewGuid();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Work?)null);

            var request = new UpdateWorkRequest(
                "Title",
                null,
                "https://link.com",
                null,
                null,
                new WorkChapterDto(null, 100),
                null,
                null
            );

            var act = async () => await _workService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task UpdateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var id = Guid.NewGuid();
            var request = new UpdateWorkRequest(
                "",
                null,
                "",
                null,
                null,
                new WorkChapterDto(null, 0),
                null,
                null
            );

            var act = async () => await _workService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
        }

        [Fact]
        public async Task DeleteAsync_ShouldCallRepositoryDelete()
        {
            var id = Guid.NewGuid();

            await _workService.DeleteAsync(id, CancellationToken.None);

            _workRepositoryMock.Verify(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task FindByNameAsync_ShouldReturnPagedWorks()
        {
            var work = EntityFactory.CreateValidWork();
            var paged = new PagedResult<Work>(new[] { work }, 1, 1, 10);

            _workRepositoryMock.Setup(x => x.FindByNameAsync("Overgeared", 1, 10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(paged);

            var result = await _workService.FindByNameAsync("Overgeared", 1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.TotalCount.Should().Be(1);
            result.Items.First().Title.Should().Be(work.Title);
        }

        [Fact]
        public async Task ListByGenreAsync_ShouldReturnPagedWorks()
        {
            var work = EntityFactory.CreateValidWork();
            var genreId = Guid.NewGuid();
            var paged = new PagedResult<Work>(new[] { work }, 1, 1, 10);

            _workRepositoryMock.Setup(x => x.ListByGenreAsync(genreId, 1, 10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(paged);

            var result = await _workService.ListByGenreAsync(genreId, 1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.TotalCount.Should().Be(1);
            result.Items.First().Title.Should().Be(work.Title);
        }

        [Fact]
        public async Task AddGenreAsync_ShouldCallRepository()
        {
            var workId = Guid.NewGuid();
            var genreId = Guid.NewGuid();

            await _workService.AddGenreAsync(workId, genreId, CancellationToken.None);

            _workRepositoryMock.Verify(x => x.AddGenreAsync(workId, genreId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task RemoveGenreAsync_ShouldCallRepository()
        {
            var workId = Guid.NewGuid();
            var genreId = Guid.NewGuid();

            await _workService.RemoveGenreAsync(workId, genreId, CancellationToken.None);

            _workRepositoryMock.Verify(x => x.RemoveGenreAsync(workId, genreId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidUrl_ShouldThrowValidationException()
        {
            var request = new CreateWorkRequest(
                "Title",
                null,
                WorkType.WebNovel,
                "not-a-valid-url",
                null,
                null,
                new WorkChapterDto(null, 100),
                Language.Korean
            );

            var act = async () => await _workService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
        }
    }
}
