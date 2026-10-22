using TaskManagement.Application.DTOs.Comments;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Mappings;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class TaskCommentService : ITaskCommentService
{
    private readonly ITaskCommentRepository _commentRepository;
    private readonly ITaskRepository _taskRepository;

    public TaskCommentService(ITaskCommentRepository commentRepository, ITaskRepository taskRepository)
    {
        _commentRepository = commentRepository;
        _taskRepository = taskRepository;
    }

    public async Task<IEnumerable<CommentResponse>> GetByTaskIdAsync(Guid taskId)
    {
        var comments = await _commentRepository.GetByTaskIdAsync(taskId);
        return comments.Select(c => c.ToResponse());
    }

    public async Task<CommentResponse> CreateAsync(Guid taskId, CreateCommentRequest request, Guid userId)
    {
        if (!await _taskRepository.ExistsAsync(taskId))
            throw new KeyNotFoundException($"Task with ID '{taskId}' was not found.");

        var comment = new TaskComment
        {
            Id = Guid.NewGuid(),
            Content = request.Content,
            TaskId = taskId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _commentRepository.CreateAsync(comment);

        return comment.ToResponse();
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var comment = await _commentRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Comment with ID '{id}' was not found.");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own comments.");

        await _commentRepository.DeleteAsync(id);
    }
}
