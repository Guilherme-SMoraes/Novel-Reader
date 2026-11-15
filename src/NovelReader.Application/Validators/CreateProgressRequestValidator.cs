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
        }
    }
}
