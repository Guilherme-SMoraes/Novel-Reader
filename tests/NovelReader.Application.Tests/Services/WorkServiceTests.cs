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
            var formats = new List<CreateWorkFormatRequest>
            {
                new(WorkType.WebNovel, new WorkChapterDto(null, 270), null, null, "https://readlightnovel.me")
            };

            var request = new CreateWorkRequest(
                "Solo Leveling",
                "Hunter Sung Jinwoo story",
                "https://novelupdates.com/series/solo-leveling",
                "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f",
                Language.Korean,
                formats
            );

            var result = await _workService.CreateAsync(request, CancellationToken.None);

            result.Should().NotBeNull();
            result.Title.Should().Be(request.Title);
            result.Description.Should().Be(request.Description);
            result.AggregatorLink.Should().Be(request.AggregatorLink);
            result.CoverImageUrl.Should().Be(request.CoverImageUrl);
            result.OriginalLanguage.Should().Be(Language.Korean);
            result.Formats.Should().HaveCount(1);
            result.Formats.First().WorkType.Should().Be(WorkType.WebNovel);
            result.Formats.First().TotalChapter.Chapter.Should().Be(270);
            result.Formats.First().LinkWhereToRead.Should().Be("https://readlightnovel.me");

            _workRepositoryMock.Verify(x => x.CreateAsync(It.Is<Work>(w => w.Title == request.Title), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var request = new CreateWorkRequest(
                "",
                null,
                "",
                null,
                Language.Korean,
                new List<CreateWorkFormatRequest>()
            );

            var act = async () => await _workService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
            _workRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Work>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task CreateAsync_WithDuplicateFormats_ShouldThrowValidationException()
        {
            var formats = new List<CreateWorkFormatRequest>
            {
                new(WorkType.WebNovel, new WorkChapterDto(null, 200)),
                new(WorkType.WebNovel, new WorkChapterDto(null, 300))
            };

            var request = new CreateWorkRequest(
                "Solo Leveling",
                null,
                "https://novelupdates.com/series/solo-leveling",
                null,
                Language.Korean,
                formats
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
            result.Formats.Should().HaveCount(1);
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

            var formats = new List<UpdateWorkFormatRequest>
            {
                new(WorkType.WebNovel, new WorkChapterDto(null, 2100), new WorkChapterDto(null, 1800), Language.English, "https://wuxiaworld.com")
            };

            var request = new UpdateWorkRequest(
                "Overgeared Updated",
                "New description",
                "https://novelupdates.com/series/overgeared-new",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477",
                formats
            );

            await _workService.UpdateAsync(work.Id, request, CancellationToken.None);

            _workRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Work>(w => w.Title == "Overgeared Updated" && w.Formats.First().TotalChapter.Chapter == 2100), It.IsAny<CancellationToken>()), Times.Once);
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
                new List<UpdateWorkFormatRequest> { new(WorkType.WebNovel, new WorkChapterDto(null, 100)) }
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
                new List<UpdateWorkFormatRequest>()
            );

            var act = async () => await _workService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
        }

        [Fact]
        public async Task CreateAsync_WithMultipleFormats_ShouldCreateAllFormats()
        {
            var formats = new List<CreateWorkFormatRequest>
            {
                new(WorkType.WebNovel, new WorkChapterDto(null, 500), new WorkChapterDto(null, 400), Language.English, "https://novel.com"),
                new(WorkType.Manhwa, new WorkChapterDto(null, 150), null, null, "https://manhwa.com")
            };

            var request = new CreateWorkRequest(
                "Multi-Format Work",
                "Description",
                "https://novelupdates.com/series/multi",
                null,
                Language.Korean,
                formats
            );

            var result = await _workService.CreateAsync(request, CancellationToken.None);

            result.Should().NotBeNull();
            result.Formats.Should().HaveCount(2);
            result.Formats.Select(f => f.WorkType).Should().Contain(new[] { WorkType.WebNovel, WorkType.Manhwa });
            _workRepositoryMock.Verify(x => x.CreateAsync(It.Is<Work>(w => w.Formats.Count == 2), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WithGenreIds_ShouldCallSetGenresAsync()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(work);

            var genreId = Guid.NewGuid();
            var formats = new List<UpdateWorkFormatRequest>
            {
                new(WorkType.WebNovel, new WorkChapterDto(null, 2059))
            };

            var request = new UpdateWorkRequest(
                "Overgeared",
                null,
                "https://link.com",
                null,
                formats,
                new List<Guid> { genreId }
            );

            await _workService.UpdateAsync(work.Id, request, CancellationToken.None);

            _workRepositoryMock.Verify(x => x.SetGenresAsync(work.Id, It.Is<IEnumerable<Guid>>(g => g.Contains(genreId)), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
