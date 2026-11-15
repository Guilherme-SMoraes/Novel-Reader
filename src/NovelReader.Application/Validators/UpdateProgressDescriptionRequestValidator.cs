using FluentValidation;
using NovelReader.Application.DTOs.Progress;

namespace NovelReader.Application.Validators
{
    public class UpdateProgressDescriptionRequestValidator : AbstractValidator<UpdateProgressDescriptionRequest>
    {
        public UpdateProgressDescriptionRequestValidator()
        {
        }
    }
}
