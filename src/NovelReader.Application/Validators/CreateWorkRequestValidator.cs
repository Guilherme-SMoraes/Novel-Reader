using FluentValidation;
using NovelReader.Application.DTOs.Works;

namespace NovelReader.Application.Validators
{
    public class CreateWorkRequestValidator : AbstractValidator<CreateWorkRequest>
    {
        public CreateWorkRequestValidator()
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

            RuleFor(x => x.WorkType)
                .IsInEnum().WithMessage("Tipo de obra inválido.");

            RuleFor(x => x.OriginalLanguage)
                .IsInEnum().WithMessage("Idioma original inválido.");
        }
    }
}
