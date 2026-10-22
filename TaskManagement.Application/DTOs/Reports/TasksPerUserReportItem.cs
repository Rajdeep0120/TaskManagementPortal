namespace TaskManagement.Application.DTOs.Reports;

public class TasksPerUserReportItem
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int ToDoCount { get; set; }
    public int InProgressCount { get; set; }
    public int DoneCount { get; set; }
    public int TotalCount { get; set; }
}
