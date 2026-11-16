using FluentValidation;
using NovelReader.Application.DTOs.Progress;

namespace NovelReader.Application.Validators
{
    public class CreateProgressRequestValidator : AbstractValidator<CreateProgressRequest>
    {
        public CreateProgressRequestValidator()
        {
            RuleFor(x => x.WorkId)
                .NotEmpty().WithMessage("WorkId inválido.");

            RuleFor(x => x.WorkType)
                .IsInEnum().WithMessage("Tipo de obra inválido.");

            RuleFor(x => x.StoppedAtChapter)
                .NotNull().WithMessage("O capítulo onde parou é obrigatório.")
                .DependentRules(() =>
                {
                    RuleFor(x => x.StoppedAtChapter.Chapter)
                        .GreaterThan(0).WithMessage("O capítulo deve ser maior que zero.");

                    RuleFor(x => x.StoppedAtChapter.Volume)
                        .GreaterThan(0)
                        .When(x => x.StoppedAtChapter.Volume.HasValue)
                        .WithMessage("O volume deve ser maior que zero.");
                });

            RuleFor(x => x.ReadingStatus)
                .IsInEnum().WithMessage("Status de leitura inválido.");

            RuleFor(x => x.ChapterLink)
                .MaximumLength(2048).WithMessage("O link do capítulo deve ter no máximo 2048 caracteres.")
                .Must(BeAValidUrl)
                .When(x => !string.IsNullOrWhiteSpace(x.ChapterLink))
                .WithMessage("O link do capítulo deve ser uma URL válida.");
        }

        private static bool BeAValidUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
            (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
