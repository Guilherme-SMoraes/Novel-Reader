using FluentValidation;
using NovelReader.Application.DTOs.Progress;

namespace NovelReader.Application.Validators
{
    public class UpdateProgressDescriptionRequestValidator : AbstractValidator<UpdateProgressDescriptionRequest>
    {
        public UpdateProgressDescriptionRequestValidator()
        {
            RuleFor(x => x.Description)
                .MaximumLength(2500)
                .When(x => !string.IsNullOrWhiteSpace(x.Description))
                .WithMessage("A descrição do progresso deve ter no máximo 2500 caracteres.");
        }
    }
}
