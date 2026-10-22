using TaskManagement.Application.DTOs.Common;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Mappings;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IProjectRepository _projectRepository;

    public TaskService(ITaskRepository taskRepository, IProjectRepository projectRepository)
    {
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
    }

    public async Task<TaskResponse> GetByIdAsync(Guid id)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Task with ID '{id}' was not found.");

        return task.ToResponse();
    }

    public async Task<PagedResult<TaskResponse>> GetFilteredAsync(TaskFilterRequest filter)
    {
        TaskItemStatus? status = filter.Status.HasValue
            ? (TaskItemStatus)filter.Status.Value
            : null;

        var (items, totalCount) = await _taskRepository.GetFilteredAsync(
            filter.ProjectId,
            status,
            filter.AssignedToUserId,
            filter.DueDateFrom,
            filter.DueDateTo,
            filter.SortBy,
            filter.SortDescending,
            filter.Page,
            filter.PageSize
        );

        return new PagedResult<TaskResponse>
        {
            Items = items.Select(t => t.ToResponse()),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<TaskResponse> CreateAsync(CreateTaskRequest request, Guid createdByUserId)
    {
        if (!await _projectRepository.ExistsAsync(request.ProjectId))
            throw new KeyNotFoundException($"Project with ID '{request.ProjectId}' was not found.");

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Priority = (TaskPriority)request.Priority,
            Status = TaskItemStatus.ToDo,
            DueDate = request.DueDate,
            ProjectId = request.ProjectId,
            AssignedToUserId = request.AssignedToUserId,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _taskRepository.CreateAsync(task);

        var createdTask = await _taskRepository.GetByIdAsync(task.Id);
        return createdTask!.ToResponse();
    }

    public async Task<TaskResponse> UpdateAsync(Guid id, UpdateTaskRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Task with ID '{id}' was not found.");

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = (TaskItemStatus)request.Status;
        task.Priority = (TaskPriority)request.Priority;
        task.DueDate = request.DueDate;
        task.AssignedToUserId = request.AssignedToUserId;
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.UpdateAsync(task);

        var updatedTask = await _taskRepository.GetByIdAsync(id);
        return updatedTask!.ToResponse();
    }

    public async Task UpdateStatusAsync(Guid id, UpdateTaskStatusRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Task with ID '{id}' was not found.");

        task.Status = (TaskItemStatus)request.Status;
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.UpdateAsync(task);
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await _taskRepository.ExistsAsync(id))
            throw new KeyNotFoundException($"Task with ID '{id}' was not found.");

        await _taskRepository.DeleteAsync(id);
    }
}
