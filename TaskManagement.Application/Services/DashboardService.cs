using TaskManagement.Application.DTOs.Dashboard;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ITaskRepository _taskRepository;

    public DashboardService(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync(Guid? projectId = null)
    {
        var statusCounts = await _taskRepository.GetStatusCountsAsync(projectId);

        return new DashboardSummaryResponse
        {
            ToDoCount = statusCounts.GetValueOrDefault(TaskItemStatus.ToDo, 0),
            InProgressCount = statusCounts.GetValueOrDefault(TaskItemStatus.InProgress, 0),
            DoneCount = statusCounts.GetValueOrDefault(TaskItemStatus.Done, 0),
            TotalCount = statusCounts.Values.Sum()
        };
    }
}
