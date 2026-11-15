using FluentValidation;
using NovelReader.Application.DTOs.Genres;

namespace NovelReader.Application.Validators
{
    public class CreateGenreRequestValidator : AbstractValidator<CreateGenreRequest>
    {
        public CreateGenreRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome do gênero não pode ser vazio.")
                .MaximumLength(100).WithMessage("O nome do gênero deve ter no máximo 100 caracteres.");

            RuleFor(x => x.Description)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.Description))
                .WithMessage("A descrição do gênero deve ter no máximo 500 caracteres.");
        }
    }
}
