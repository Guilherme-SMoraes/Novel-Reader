using FluentAssertions;
using FluentValidation;
using Moq;
using NovelReader.Application.DTOs.Attachments;
using NovelReader.Application.Services;
using NovelReader.Application.Validators;
using NovelReader.Common.Tests.Helpers;
using NovelReader.Domain.Entities;
using NovelReader.Domain.Interfaces.Repositories;

namespace NovelReader.Application.Tests.Services
{
    public class AttachmentServiceTests
    {
        private readonly Mock<IAttachmentRepository> _attachmentRepositoryMock;
        private readonly Mock<IWorkRepository> _workRepositoryMock;
        private readonly AttachmentService _attachmentService;

        public AttachmentServiceTests()
        {
            _attachmentRepositoryMock = new Mock<IAttachmentRepository>();
            _workRepositoryMock = new Mock<IWorkRepository>();
            var createValidator = new CreateAttachmentRequestValidator();
            var updateValidator = new UpdateAttachmentRequestValidator();
            _attachmentService = new AttachmentService(
                _attachmentRepositoryMock.Object,
                _workRepositoryMock.Object,
                createValidator,
                updateValidator);
        }

        [Fact]
        public async Task CreateAsync_WithValidData_ShouldCreateAndReturnResponse()
        {
            var work = EntityFactory.CreateValidWork();
            _workRepositoryMock.Setup(x => x.ExistsAsync(work.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var request = new CreateAttachmentRequest
            {
                Title = "Hierarquia dos Magos",
                Category = "Sistema de Poder",
                Content = "Nível 1 a 9",
                ImageUrl = "https://example.com/tier.png"
            };

            var result = await _attachmentService.CreateAsync(work.Id, request, CancellationToken.None);

            result.Should().NotBeNull();
            result.Title.Should().Be("Hierarquia dos Magos");
            result.Category.Should().Be("Sistema de Poder");
            result.Content.Should().Be("Nível 1 a 9");
            result.ImageUrl.Should().Be("https://example.com/tier.png");

            _attachmentRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Attachment>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_WhenWorkNotFound_ShouldThrowKeyNotFoundException()
        {
            var workId = Guid.NewGuid();
            _workRepositoryMock.Setup(x => x.ExistsAsync(workId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var request = new CreateAttachmentRequest
            {
                Title = "Mapa",
                Category = "Mapa"
            };

            var act = async () => await _attachmentService.CreateAsync(workId, request, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
            _attachmentRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Attachment>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task CreateAsync_WithInvalidData_ShouldThrowValidationException()
        {
            var request = new CreateAttachmentRequest
            {
                Title = "",
                Category = ""
            };

            var act = async () => await _attachmentService.CreateAsync(Guid.NewGuid(), request, CancellationToken.None);

            await act.Should().ThrowAsync<ValidationException>();
        }

        [Fact]
        public async Task UpdateAsync_WithValidData_ShouldUpdateAndReturnResponse()
        {
            var attachment = new Attachment("Antigo", "Mapa", Guid.NewGuid());
            _attachmentRepositoryMock.Setup(x => x.GetByIdAsync(attachment.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(attachment);
            _workRepositoryMock.Setup(x => x.ExistsAsync(attachment.WorkId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var request = new UpdateAttachmentRequest
            {
                Title = "Novo",
                Category = "Lore",
                Content = "História antiga",
                ImageUrl = "https://example.com/img.jpg"
            };

            var result = await _attachmentService.UpdateAsync(attachment.Id, request, CancellationToken.None);

            result.Should().NotBeNull();
            result.Title.Should().Be("Novo");
            result.Category.Should().Be("Lore");
            result.Content.Should().Be("História antiga");

            _attachmentRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<Attachment>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WhenNotFound_ShouldThrowKeyNotFoundException()
        {
            var id = Guid.NewGuid();
            _attachmentRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Attachment?)null);

            var request = new UpdateAttachmentRequest
            {
                Title = "Novo",
                Category = "Lore"
            };

            var act = async () => await _attachmentService.UpdateAsync(id, request, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task DeleteAsync_WhenFound_ShouldDelete()
        {
            var attachment = new Attachment("Mapa", "Mapa", Guid.NewGuid());
            _attachmentRepositoryMock.Setup(x => x.GetByIdAsync(attachment.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(attachment);
            _workRepositoryMock.Setup(x => x.ExistsAsync(attachment.WorkId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            await _attachmentService.DeleteAsync(attachment.Id, CancellationToken.None);

            _attachmentRepositoryMock.Verify(x => x.DeleteAsync(attachment.Id, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WhenNotFound_ShouldThrowKeyNotFoundException()
        {
            var id = Guid.NewGuid();
            _attachmentRepositoryMock.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Attachment?)null);

            var act = async () => await _attachmentService.DeleteAsync(id, CancellationToken.None);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }
    }
}
