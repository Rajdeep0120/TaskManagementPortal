using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Interfaces;

public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(Guid id);
    Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetFilteredAsync(
        Guid? projectId,
        TaskItemStatus? status,
        Guid? assignedToUserId,
        DateTime? dueDateFrom,
        DateTime? dueDateTo,
        string? sortBy,
        bool sortDescending,
        int page,
        int pageSize);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task UpdateAsync(TaskItem task);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<Dictionary<TaskItemStatus, int>> GetStatusCountsAsync(Guid? projectId = null);
}

