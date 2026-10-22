using FluentValidation;
using TaskManagement.Application.DTOs.Tasks;

namespace TaskManagement.Application.Validators;

public class UpdateTaskStatusValidator : AbstractValidator<UpdateTaskStatusRequest>
{
    public UpdateTaskStatusValidator()
    {
        RuleFor(x => x.Status)
            .InclusiveBetween(0, 2).WithMessage("Status must be between 0 (ToDo) and 2 (Done).");
    }
}
