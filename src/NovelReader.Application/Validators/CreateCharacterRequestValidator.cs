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
                .NotEmpty().WithMessage("O nome do personagem não pode ser vazio.")
                .MaximumLength(200).WithMessage("O nome do personagem deve ter no máximo 200 caracteres.");

            RuleFor(x => x.Description)
                .MaximumLength(2500)
                .When(x => !string.IsNullOrWhiteSpace(x.Description))
                .WithMessage("A descrição do personagem deve ter no máximo 2500 caracteres.");

            RuleFor(x => x.ImageUrl)
                .MaximumLength(2048).WithMessage("O link da foto deve ter no máximo 2048 caracteres.")
                .Must(BeAValidUrl)
                .When(x => !string.IsNullOrWhiteSpace(x.ImageUrl))
                .WithMessage("O link da foto deve ser uma URL válida.");

            RuleFor(x => x.CharacterType)
                .IsInEnum().WithMessage("Tipo de personagem inválido.");

            RuleForEach(x => x.AlternativeNames)
                .MaximumLength(200).WithMessage("Cada nome alternativo deve ter no máximo 200 caracteres.")
                .When(x => x.AlternativeNames != null);

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

        private static bool BeAValidUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
            (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
