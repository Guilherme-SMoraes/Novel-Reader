using FluentValidation;
using NovelReader.Application.DTOs.Characters;

namespace NovelReader.Application.Validators
{
    public class UpdateCharacterRequestValidator : AbstractValidator<UpdateCharacterRequest>
    {
        public UpdateCharacterRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome do personagem não pode ser vazio.");

            RuleFor(x => x.CharacterType)
                .IsInEnum().WithMessage("Tipo de personagem inválido.");
        }
    }
}
