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

            RuleFor(x => x.CoverImageUrl)
                .MaximumLength(2048).WithMessage("O link da capa deve ter no máximo 2048 caracteres.")
                .Must(BeAValidUrl)
                .When(x => !string.IsNullOrWhiteSpace(x.CoverImageUrl))
                .WithMessage("O link da capa deve ser uma URL válida.");

            RuleForEach(x => x.AlternativeTitles)
                .MaximumLength(200).WithMessage("Cada título alternativo deve ter no máximo 200 caracteres.")
                .When(x => x.AlternativeTitles != null);

            RuleFor(x => x.Formats)
                .NotEmpty().WithMessage("A obra deve conter pelo menos um formato.")
                .Must(formats => formats != null && formats.Select(f => f.WorkType).Distinct().Count() == formats.Count)
                .WithMessage("Não pode haver formatos repetidos na mesma obra.");

            RuleForEach(x => x.Formats).ChildRules(format =>
            {
                format.RuleFor(f => f.WorkType)
                    .IsInEnum().WithMessage("Tipo de obra inválido.");

                format.RuleFor(f => f.TotalChapter)
                    .NotNull().WithMessage("O total de capítulos é obrigatório.")
                    .DependentRules(() =>
                    {
                        format.RuleFor(f => f.TotalChapter.Chapter)
                            .GreaterThan(0).WithMessage("O capítulo deve ser maior que zero.");

                        format.RuleFor(f => f.TotalChapter.Volume)
                            .GreaterThan(0)
                            .When(f => f.TotalChapter.Volume.HasValue)
                            .WithMessage("O volume deve ser maior que zero.");
                    });

                format.RuleFor(f => f.TranslatedUpTo!)
                    .Must(x => x.Chapter > 0)
                    .When(f => f.TranslatedUpTo != null)
                    .WithMessage("O capítulo traduzido deve ser maior que zero.");

                format.RuleFor(f => f.TranslatedUpTo!)
                    .Must(x => !x.Volume.HasValue || x.Volume > 0)
                    .When(f => f.TranslatedUpTo != null)
                    .WithMessage("O volume traduzido deve ser maior que zero.");

                format.RuleFor(f => f.TranslatedLanguage)
                    .NotNull().WithMessage("O idioma traduzido é obrigatório quando há capítulos traduzidos informados.")
                    .IsInEnum().WithMessage("Idioma traduzido inválido.")
                    .When(f => f.TranslatedUpTo != null);

                format.RuleFor(f => f.TranslatedUpTo)
                    .NotNull().WithMessage("Os capítulos traduzidos são obrigatórios quando o idioma traduzido for informado.")
                    .When(f => f.TranslatedLanguage.HasValue);

                format.RuleFor(f => f.TranslatedUpTo!)
                    .Must((f, translated) => translated.Chapter <= f.TotalChapter.Chapter)
                    .When(f => f.TranslatedUpTo != null && f.TotalChapter != null)
                    .WithMessage("O capítulo traduzido não pode ser maior que o total de capítulos.");

                format.RuleFor(f => f.TranslatedUpTo!)
                    .Must((f, translated) => !translated.Volume.HasValue || !f.TotalChapter.Volume.HasValue || translated.Volume <= f.TotalChapter.Volume)
                    .When(f => f.TranslatedUpTo != null && f.TotalChapter != null)
                    .WithMessage("O volume traduzido não pode ser maior que o total de volumes.");

                format.RuleFor(f => f.LinkWhereToRead)
                    .MaximumLength(2048).WithMessage("O link de leitura deve ter no máximo 2048 caracteres.")
                    .Must(BeAValidUrl)
                    .When(f => !string.IsNullOrWhiteSpace(f.LinkWhereToRead))
                    .WithMessage("O link de leitura deve ser uma URL válida.");
            });
        }

        private static bool BeAValidUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
            (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
