namespace TaskManagement.Application.DTOs.Dashboard;

public class DashboardSummaryResponse
{
    public int ToDoCount { get; set; }
    public int InProgressCount { get; set; }
    public int DoneCount { get; set; }
    public int TotalCount { get; set; }
}
