using FluentValidation;
using TaskManagement.Application.DTOs.Comments;

namespace TaskManagement.Application.Validators;

public class CreateCommentValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content is required.")
            .MaximumLength(2000).WithMessage("Comment content must not exceed 2000 characters.");
    }
}
