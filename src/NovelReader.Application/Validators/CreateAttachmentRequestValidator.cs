using FluentValidation;
using NovelReader.Application.DTOs.Attachments;

namespace NovelReader.Application.Validators
{
    public class CreateAttachmentRequestValidator : AbstractValidator<CreateAttachmentRequest>
    {
        public CreateAttachmentRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("O título do anexo não pode ser vazio.")
                .MaximumLength(200).WithMessage("O título deve ter no máximo 200 caracteres.");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("A categoria do anexo não pode ser vazia.")
                .MaximumLength(100).WithMessage("A categoria deve ter no máximo 100 caracteres.");

            RuleFor(x => x.ImageUrl)
                .MaximumLength(2048).WithMessage("O link da imagem deve ter no máximo 2048 caracteres.")
                .Must(BeAValidUrl)
                .When(x => !string.IsNullOrWhiteSpace(x.ImageUrl))
                .WithMessage("O link da imagem deve ser uma URL válida.");
        }

        private static bool BeAValidUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
            (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
