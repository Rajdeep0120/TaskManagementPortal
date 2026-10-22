using TaskManagement.Application.DTOs.Reports;

namespace TaskManagement.Application.Interfaces;

public interface IReportService
{
    Task<IEnumerable<TasksPerUserReportItem>> GetTasksPerUserReportAsync();
}
