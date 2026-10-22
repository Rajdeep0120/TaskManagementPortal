namespace TaskManagement.Domain.Entities;

public class TaskComment
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public TaskItem Task { get; set; } = null!;
    public User User { get; set; } = null!;
}

