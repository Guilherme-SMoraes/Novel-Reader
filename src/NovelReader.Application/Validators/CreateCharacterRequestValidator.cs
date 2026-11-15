using FluentValidation;
using NovelReader.Application.DTOs.Characters;

namespace NovelReader.Application.Validators
{
    public class CreateCharacterRequestValidator : AbstractValidator<CreateCharacterRequest>
    {
        public CreateCharacterRequestValidator()
        {
            RuleFor(x => x.WorkId)
                .NotEmpty().WithMessage("WorkId inválido.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome do personagem não pode ser vazio.");

            RuleFor(x => x.CharacterType)
                .IsInEnum().WithMessage("Tipo de personagem inválido.");

            RuleFor(x => x.FirstAppearance)
                .NotNull().WithMessage("A primeira aparição é obrigatória.")
                .DependentRules(() =>
                {
                    RuleFor(x => x.FirstAppearance.Chapter)
                        .GreaterThan(0).WithMessage("O capítulo deve ser maior que zero.");

                    RuleFor(x => x.FirstAppearance.Volume)
                        .GreaterThan(0)
                        .When(x => x.FirstAppearance.Volume.HasValue)
                        .WithMessage("O volume deve ser maior que zero.");
                });
        }
    }
}
