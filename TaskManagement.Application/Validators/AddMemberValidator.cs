using FluentValidation;
using TaskManagement.Application.DTOs.Projects;

namespace TaskManagement.Application.Validators;

public class AddMemberValidator : AbstractValidator<AddMemberRequest>
{
    public AddMemberValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}
