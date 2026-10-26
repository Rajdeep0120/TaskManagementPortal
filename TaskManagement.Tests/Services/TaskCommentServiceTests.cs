using FluentAssertions;
using Moq;
using TaskManagement.Application.DTOs.Comments;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;
using Xunit;

namespace TaskManagement.Tests.Services;

public class TaskCommentServiceTests
{
    private readonly Mock<ITaskCommentRepository> _commentRepoMock;
    private readonly Mock<ITaskRepository> _taskRepoMock;
    private readonly TaskCommentService _commentService;

    public TaskCommentServiceTests()
    {
        _commentRepoMock = new Mock<ITaskCommentRepository>();
        _taskRepoMock = new Mock<ITaskRepository>();
        _commentService = new TaskCommentService(_commentRepoMock.Object, _taskRepoMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WhenTaskExists_CreatesComment()
    {
        // Arrange
        var taskId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var request = new CreateCommentRequest { Content = "Great progress!" };

        _taskRepoMock.Setup(r => r.ExistsAsync(taskId)).ReturnsAsync(true);
        _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<TaskComment>()))
            .ReturnsAsync((TaskComment c) => c);

        // Act
        var result = await _commentService.CreateAsync(taskId, request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Content.Should().Be("Great progress!");
        result.TaskId.Should().Be(taskId);
        _commentRepoMock.Verify(r => r.CreateAsync(It.Is<TaskComment>(c => c.Content == request.Content && c.TaskId == taskId && c.UserId == userId)), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenUserIsOwner_DeletesComment()
    {
        // Arrange
        var commentId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var comment = new TaskComment
        {
            Id = commentId,
            UserId = userId,
            Content = "My comment"
        };

        _commentRepoMock.Setup(r => r.GetByIdAsync(commentId)).ReturnsAsync(comment);
        _commentRepoMock.Setup(r => r.DeleteAsync(commentId)).Returns(Task.CompletedTask);

        // Act
        await _commentService.DeleteAsync(commentId, userId);

        // Assert
        _commentRepoMock.Verify(r => r.DeleteAsync(commentId), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenUserIsNotOwner_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var commentId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var anotherUserId = Guid.NewGuid();
        var comment = new TaskComment
        {
            Id = commentId,
            UserId = ownerId,
            Content = "Owner comment"
        };

        _commentRepoMock.Setup(r => r.GetByIdAsync(commentId)).ReturnsAsync(comment);

        // Act
        var act = async () => await _commentService.DeleteAsync(commentId, anotherUserId);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("You can only delete your own comments.");
    }
}

