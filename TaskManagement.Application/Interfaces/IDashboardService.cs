using TaskManagement.Application.DTOs.Dashboard;

namespace TaskManagement.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(Guid? projectId = null);
}
