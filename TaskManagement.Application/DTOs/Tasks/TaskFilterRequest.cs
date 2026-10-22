namespace TaskManagement.Application.DTOs.Tasks;

public class TaskFilterRequest
{
    public Guid? ProjectId { get; set; }
    public int? Status { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public DateTime? DueDateFrom { get; set; }
    public DateTime? DueDateTo { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
