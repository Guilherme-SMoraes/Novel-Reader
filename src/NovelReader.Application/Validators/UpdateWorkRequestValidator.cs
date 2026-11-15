using FluentValidation;
using NovelReader.Application.DTOs.Works;

namespace NovelReader.Application.Validators
{
    public class UpdateWorkRequestValidator : AbstractValidator<UpdateWorkRequest>
    {
        public UpdateWorkRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("O título não pode ser vazio.")
                .MaximumLength(200).WithMessage("O título deve ter no máximo 200 caracteres.");

            RuleFor(x => x.Description)
                .MaximumLength(1500)
                .When(x => !string.IsNullOrWhiteSpace(x.Description))
                .WithMessage("A descrição deve ter no máximo 1500 caracteres.");

            RuleFor(x => x.AggregatorLink)
                .NotEmpty().WithMessage("O link do agregador não pode ser vazio.")
                .MaximumLength(2048).WithMessage("O link do agregador deve ter no máximo 2048 caracteres.")
                .Must(BeAValidUrl).WithMessage("O link do agregador deve ser uma URL válida.");

            RuleFor(x => x.LinkWhereToRead)
                .MaximumLength(2048).WithMessage("O link de leitura deve ter no máximo 2048 caracteres.")
                .Must(BeAValidUrl)
                .When(x => !string.IsNullOrWhiteSpace(x.LinkWhereToRead))
                .WithMessage("O link de leitura deve ser uma URL válida.");

            RuleFor(x => x.CoverImageUrl)
                .MaximumLength(2048).WithMessage("O link da capa deve ter no máximo 2048 caracteres.")
                .Must(BeAValidUrl)
                .When(x => !string.IsNullOrWhiteSpace(x.CoverImageUrl))
                .WithMessage("O link da capa deve ser uma URL válida.");

            RuleFor(x => x.TotalChapter)
                .NotNull().WithMessage("O total de capítulos é obrigatório.")
                .DependentRules(() =>
                {
                    RuleFor(x => x.TotalChapter.Chapter)
                        .GreaterThan(0).WithMessage("O capítulo deve ser maior que zero.");

                    RuleFor(x => x.TotalChapter.Volume)
                        .GreaterThan(0)
                        .When(x => x.TotalChapter.Volume.HasValue)
                        .WithMessage("O volume deve ser maior que zero.");
                });

            RuleFor(x => x.TranslatedUpTo!)
                .Must(x => x.Chapter > 0)
                .When(x => x.TranslatedUpTo != null)
                .WithMessage("O capítulo traduzido deve ser maior que zero.");

            RuleFor(x => x.TranslatedUpTo!)
                .Must(x => !x.Volume.HasValue || x.Volume > 0)
                .When(x => x.TranslatedUpTo != null)
                .WithMessage("O volume traduzido deve ser maior que zero.");
        }

        private static bool BeAValidUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
            (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
