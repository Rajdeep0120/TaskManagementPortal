namespace TaskManagement.Application.DTOs.Projects;

public class ProjectMemberResponse
{
    public Guid UserId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public DateTime JoinedAt { get; set; }
}
