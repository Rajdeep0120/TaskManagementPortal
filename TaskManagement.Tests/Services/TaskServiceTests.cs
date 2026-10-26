using FluentAssertions;
using Moq;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;
using Xunit;

namespace TaskManagement.Tests.Services;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _taskRepoMock;
    private readonly Mock<IProjectRepository> _projectRepoMock;
    private readonly TaskService _taskService;

    public TaskServiceTests()
    {
        _taskRepoMock = new Mock<ITaskRepository>();
        _projectRepoMock = new Mock<IProjectRepository>();
        _taskService = new TaskService(_taskRepoMock.Object, _projectRepoMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenTaskExists_ReturnsTaskResponse()
    {
        // Arrange
        var taskId = Guid.NewGuid();
        var task = new TaskItem
        {
            Id = taskId,
            Title = "Implement Auth",
            Description = "JWT Authentication implementation",
            Status = TaskItemStatus.InProgress,
            Priority = TaskPriority.High,
            CreatedAt = DateTime.UtcNow
        };

        _taskRepoMock.Setup(r => r.GetByIdAsync(taskId)).ReturnsAsync(task);

        // Act
        var result = await _taskService.GetByIdAsync(taskId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(taskId);
        result.Title.Should().Be("Implement Auth");
        result.StatusName.Should().Be("InProgress");
        result.PriorityName.Should().Be("High");
    }

    [Fact]
    public async Task GetByIdAsync_WhenTaskNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var taskId = Guid.NewGuid();
        _taskRepoMock.Setup(r => r.GetByIdAsync(taskId)).ReturnsAsync((TaskItem?)null);

        // Act
        var act = async () => await _taskService.GetByIdAsync(taskId);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CreateAsync_WhenProjectExists_CreatesAndReturnsTask()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var request = new CreateTaskRequest
        {
            Title = "New Task",
            Description = "Task Desc",
            Priority = 2, // High
            ProjectId = projectId
        };

        _projectRepoMock.Setup(r => r.ExistsAsync(projectId)).ReturnsAsync(true);
        _taskRepoMock.Setup(r => r.CreateAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem t) => t);
        _taskRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Guid id) => new TaskItem
            {
                Id = id,
                Title = request.Title,
                Description = request.Description,
                Priority = TaskPriority.High,
                Status = TaskItemStatus.ToDo,
                ProjectId = projectId,
                CreatedByUserId = userId
            });

        // Act
        var result = await _taskService.CreateAsync(request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(request.Title);
        result.PriorityName.Should().Be("High");
        result.StatusName.Should().Be("ToDo");
        _taskRepoMock.Verify(r => r.CreateAsync(It.IsAny<TaskItem>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WhenProjectDoesNotExist_ThrowsKeyNotFoundException()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var request = new CreateTaskRequest
        {
            Title = "Orphan Task",
            ProjectId = projectId
        };

        _projectRepoMock.Setup(r => r.ExistsAsync(projectId)).ReturnsAsync(false);

        // Act
        var act = async () => await _taskService.CreateAsync(request, Guid.NewGuid());

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"*{projectId}*");
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenTaskExists_UpdatesStatus()
    {
        // Arrange
        var taskId = Guid.NewGuid();
        var existingTask = new TaskItem
        {
            Id = taskId,
            Title = "Task",
            Status = TaskItemStatus.ToDo
        };

        _taskRepoMock.Setup(r => r.GetByIdAsync(taskId)).ReturnsAsync(existingTask);
        _taskRepoMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).Returns(Task.CompletedTask);

        var request = new UpdateTaskStatusRequest { Status = 2 }; // Done

        // Act
        await _taskService.UpdateStatusAsync(taskId, request);

        // Assert
        existingTask.Status.Should().Be(TaskItemStatus.Done);
        _taskRepoMock.Verify(r => r.UpdateAsync(existingTask), Times.Once);
    }
}

