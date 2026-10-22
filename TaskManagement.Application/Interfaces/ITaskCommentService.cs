using TaskManagement.Application.DTOs.Comments;

namespace TaskManagement.Application.Interfaces;

public interface ITaskCommentService
{
    Task<IEnumerable<CommentResponse>> GetByTaskIdAsync(Guid taskId);
    Task<CommentResponse> CreateAsync(Guid taskId, CreateCommentRequest request, Guid userId);
    Task DeleteAsync(Guid id, Guid userId);
}
