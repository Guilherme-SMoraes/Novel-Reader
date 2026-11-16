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

            RuleFor(x => x.FirstAppearances)
                .NotEmpty().WithMessage("A primeira aparição deve ser preenchida em pelo menos um formato.")
                .Must(HaveUniqueWorkTypes).WithMessage("Não é permitido repetir o mesmo formato de aparição.");

            RuleForEach(x => x.FirstAppearances)
                .ChildRules(app =>
                {
                    app.RuleFor(a => a.WorkType)
                        .IsInEnum().WithMessage("Tipo de obra inválido na primeira aparição.");

                    app.RuleFor(a => a.Chapter)
                        .NotNull().WithMessage("O capítulo de primeira aparição é obrigatório.");

                    app.RuleFor(a => a.Chapter.Chapter)
                        .GreaterThan(0).WithMessage("O capítulo deve ser maior que zero.");

                    app.RuleFor(a => a.Chapter.Volume)
                        .GreaterThan(0)
                        .When(a => a.Chapter != null && a.Chapter.Volume.HasValue)
                        .WithMessage("O volume deve ser maior que zero.");
                });
        }

        private static bool HaveUniqueWorkTypes(List<CharacterAppearanceDto>? list) =>
            list == null || list.Select(x => x.WorkType).Distinct().Count() == list.Count;

        private static bool BeAValidUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
            (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
