using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces;

public interface ITaskCommentRepository
{
    Task<TaskComment?> GetByIdAsync(Guid id);
    Task<IEnumerable<TaskComment>> GetByTaskIdAsync(Guid taskId);
    Task<TaskComment> CreateAsync(TaskComment comment);
    Task DeleteAsync(Guid id);
}

