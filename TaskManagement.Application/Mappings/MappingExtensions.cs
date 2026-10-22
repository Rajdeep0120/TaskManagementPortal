using TaskManagement.Application.DTOs.Comments;
using TaskManagement.Application.DTOs.Projects;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Mappings;

public static class MappingExtensions
{
    public static ProjectResponse ToResponse(this Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedByUserId = project.CreatedByUserId,
            CreatedByName = project.CreatedBy?.FullName,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            MemberCount = project.Members?.Count ?? 0,
            TaskCount = project.Tasks?.Count ?? 0
        };
    }

    public static TaskResponse ToResponse(this TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = (int)task.Status,
            StatusName = task.Status.ToString(),
            Priority = (int)task.Priority,
            PriorityName = task.Priority.ToString(),
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name,
            AssignedToUserId = task.AssignedToUserId,
            AssignedToName = task.AssignedTo?.FullName,
            CreatedByUserId = task.CreatedByUserId,
            CreatedByName = task.CreatedBy?.FullName,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CommentCount = task.Comments?.Count ?? 0
        };
    }

    public static CommentResponse ToResponse(this TaskComment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            Content = comment.Content,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = comment.User?.FullName,
            CreatedAt = comment.CreatedAt
        };
    }

    public static ProjectMemberResponse ToResponse(this ProjectMember member)
    {
        return new ProjectMemberResponse
        {
            UserId = member.UserId,
            FullName = member.User?.FullName,
            Email = member.User?.Email,
            JoinedAt = member.JoinedAt
        };
    }
}
