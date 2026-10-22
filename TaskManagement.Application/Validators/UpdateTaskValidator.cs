using FluentValidation;
using TaskManagement.Application.DTOs.Tasks;

namespace TaskManagement.Application.Validators;

public class UpdateTaskValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required.")
            .MaximumLength(200).WithMessage("Task title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");

        RuleFor(x => x.Status)
            .InclusiveBetween(0, 2).WithMessage("Status must be between 0 (ToDo) and 2 (Done).");

        RuleFor(x => x.Priority)
            .InclusiveBetween(0, 2).WithMessage("Priority must be between 0 (Low) and 2 (High).");
    }
}
