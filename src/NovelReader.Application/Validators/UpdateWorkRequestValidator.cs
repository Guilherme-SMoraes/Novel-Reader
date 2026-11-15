using FluentValidation;
using NovelReader.Application.DTOs.Works;

namespace NovelReader.Application.Validators
{
    public class UpdateWorkRequestValidator : AbstractValidator<UpdateWorkRequest>
    {
        public UpdateWorkRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("O título não pode ser vazio.");

            RuleFor(x => x.AggregatorLink)
                .NotEmpty().WithMessage("O link do agregador não pode ser vazio.");

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
    }
}
