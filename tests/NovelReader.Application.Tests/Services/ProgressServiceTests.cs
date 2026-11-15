using FluentAssertions;
using FluentValidation;
using Moq;
using NovelReader.Application.DTOs.Common;
using NovelReader.Application.DTOs.Progress;
using NovelReader.Application.Services;
using NovelReader.Application.Validators;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Domain.Common;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Enums;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Application.Tests.Services
{
    public class ProgressServiceTests
    {
        private readonly Mock<IProgressRepository> _progressRepositoryMock;
        private readonly Mock<IWorkRepository> _workRepositoryMock;
        private readonly ProgressService _progressService;

        public ProgressServiceTests()
        {
            _progressRepositoryMock = new Mock<IProgressRepository>();
            _workRepositoryMock = new Mock<IWorkRepository>();
            var validator = new CreateProgressRequestValidator();
            _progressService = new ProgressService(
                _progressRepositoryMock.Object,
                _workRepositoryMock.Object,
                validator
            );
        }

        [Fact]
        public async Task CreateAsync_WithValidDataAndExistingWork_ShouldCreateAndReturnProgressResponse()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(work);

            var request = new CreateProgressRequest(
                work.Id,
                WorkType.WebNovel,
                new WorkChapterDto(null, 150),
                ReadingStatus.Reading,
                "Arc 2 finished"
            );

            var result = await _progressService.CreateAsync(request, CancellationToken.None);

            result.Should().NotBeNull();
            result.WorkId.Should().Be(work.Id);
            result.WorkType.Should().Be(WorkType.WebNovel);
            result.StoppedAtChapter.Chapter.Should().Be(150);
            result.ReadingStatus.Should().Be(ReadingStatus.Reading);
            result.ReadingDescription.Should().Be("Arc 2 finished");

            _progressRepositoryMock.Verify(x => x.CreateAsync(It.Is<Progress>(p => p.WorkId == work.Id && p.WorkType == WorkType.WebNovel), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WhenWorkDoesNotExist_ShouldThrowKeyNotFoundException()
        {
            var workId = Guid.NewGuid();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(workId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Work?)null);

            var request = new CreateProgressRequest(
                workId,
                WorkType.WebNovel,
                new WorkChapterDto(null, 150),
                ReadingStatus.Reading,
                null
            );

            var act = async () => await _progressService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
            _progressRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Progress>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task CreateAsync_WhenWorkDoesNotHaveFormat_ShouldThrowInvalidOperationException()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(work);

            var request = new CreateProgressRequest(
                work.Id,
                WorkType.Manhwa, // work only has WebNovel
                new WorkChapterDto(null, 10),
                ReadingStatus.Reading,
                null
            );

            var act = async () => await _progressService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<InvalidOperationException>();
            _progressRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Progress>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var request = new CreateProgressRequest(
                Guid.Empty,
                WorkType.WebNovel,
                new WorkChapterDto(null, 0),
                (ReadingStatus)999,
                null
            );

            var act = async () => await _progressService.CreateAsync(request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
            _progressRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Progress>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task GetByWorkIdAsync_WhenWorkExists_ShouldReturnPagedProgress()
        {
            var work = EntityFactory.CreateValidWork();
            var progress = EntityFactory.CreateValidProgress(work.Id, WorkType.WebNovel);
            var paged = new PagedResult<Progress>(new[] { progress }, 1, 1, 10);

            _workRepositoryMock.Setup(x => x.GetByIdAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(work);
            _progressRepositoryMock.Setup(x => x.GetByWorkIdAsync(work.Id, null, 1, 10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(paged);

            var result = await _progressService.GetByWorkIdAsync(work.Id, null, 1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.TotalCount.Should().Be(1);
            result.Items.Should().HaveCount(1);
            result.Items.First().WorkId.Should().Be(work.Id);
            result.Items.First().WorkType.Should().Be(WorkType.WebNovel);
        }

        [Fact]
        public async Task GetByWorkIdAsync_WithWorkTypeFilter_ShouldPassWorkTypeToRepository()
        {
            var work = EntityFactory.CreateValidWork();
            var progress = EntityFactory.CreateValidProgress(work.Id, WorkType.WebNovel);
            var paged = new PagedResult<Progress>(new[] { progress }, 1, 1, 10);

            _workRepositoryMock.Setup(x => x.GetByIdAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(work);
            _progressRepositoryMock.Setup(x => x.GetByWorkIdAsync(work.Id, WorkType.WebNovel, 1, 10, It.IsAny<CancellationToken>()))
                .ReturnsAsync(paged);

            var result = await _progressService.GetByWorkIdAsync(work.Id, WorkType.WebNovel, 1, 10, CancellationToken.None);

            result.Should().NotBeNull();
            result.Items.First().WorkType.Should().Be(WorkType.WebNovel);
            _progressRepositoryMock.Verify(x => x.GetByWorkIdAsync(work.Id, WorkType.WebNovel, 1, 10, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetByWorkIdAsync_WhenWorkDoesNotExist_ShouldThrowKeyNotFoundException()
        {
            var workId = Guid.NewGuid();
            _workRepositoryMock.Setup(x => x.GetByIdAsync(workId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Work?)null);

            var act = async () => await _progressService.GetByWorkIdAsync(workId, null, 1, 10, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task GetByIdAsync_WhenExists_ShouldReturnProgressResponse()
        {
            var progress = EntityFactory.CreateValidProgress(Guid.NewGuid(), WorkType.WebNovel);
            _progressRepositoryMock.Setup(x => x.GetByIdAsync(progress.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(progress);

            var result = await _progressService.GetByIdAsync(progress.Id, CancellationToken.None);

            result.Should().NotBeNull();
            result!.Id.Should().Be(progress.Id);
            result.WorkType.Should().Be(WorkType.WebNovel);
        }

        [Fact]
        public async Task GetByIdAsync_WhenDoesNotExist_ShouldReturnNull()
        {
            var id = Guid.NewGuid();
            _progressRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Progress?)null);

            var result = await _progressService.GetByIdAsync(id, CancellationToken.None);

            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateDescriptionAsync_ShouldCallRepository()
        {
            var id = Guid.NewGuid();
            var request = new UpdateProgressDescriptionRequest("New note");

            await _progressService.UpdateDescriptionAsync(id, request, CancellationToken.None);

            _progressRepositoryMock.Verify(x => x.UpdateDescriptionAsync(id, "New note", It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_ShouldCallRepository()
        {
            var id = Guid.NewGuid();

            await _progressService.DeleteAsync(id, CancellationToken.None);

            _progressRepositoryMock.Verify(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
