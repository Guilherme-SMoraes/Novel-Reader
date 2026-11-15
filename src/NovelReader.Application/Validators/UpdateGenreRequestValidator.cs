using FluentValidation;
using NovelReader.Application.DTOs.Genres;

namespace NovelReader.Application.Validators
{
    public class UpdateGenreRequestValidator : AbstractValidator<UpdateGenreRequest>
    {
        public UpdateGenreRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome do gênero não pode ser vazio.");
        }
    }
}
