using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.Comments;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/tasks/{taskId:guid}/comments")]
[Authorize]
public class TaskCommentsController : ControllerBase
{
    private readonly ITaskCommentService _commentService;

    public TaskCommentsController(ITaskCommentService commentService)
    {
        _commentService = commentService;
    }

    /// <summary>
    /// Get all comments for a task
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CommentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CommentResponse>>> GetByTaskId(Guid taskId)
    {
        var result = await _commentService.GetByTaskIdAsync(taskId);
        return Ok(result);
    }

    /// <summary>
    /// Add a comment to a task
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<CommentResponse>> Create(Guid taskId, [FromBody] CreateCommentRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _commentService.CreateAsync(taskId, request, userId);
        return Created(string.Empty, result);
    }

    /// <summary>
    /// Delete a comment (only by the comment author)
    /// </summary>
    [HttpDelete("{commentId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid taskId, Guid commentId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _commentService.DeleteAsync(commentId, userId);
        return NoContent();
    }
}

