using TaskManagement.Application.DTOs.Common;
using TaskManagement.Application.DTOs.Tasks;

namespace TaskManagement.Application.Interfaces;

public interface ITaskService
{
    Task<TaskResponse> GetByIdAsync(Guid id);
    Task<PagedResult<TaskResponse>> GetFilteredAsync(TaskFilterRequest filter);
    Task<TaskResponse> CreateAsync(CreateTaskRequest request, Guid createdByUserId);
    Task<TaskResponse> UpdateAsync(Guid id, UpdateTaskRequest request);
    Task UpdateStatusAsync(Guid id, UpdateTaskStatusRequest request);
    Task DeleteAsync(Guid id);
}
