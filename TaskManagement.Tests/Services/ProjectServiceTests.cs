using FluentAssertions;
using Moq;
using TaskManagement.Application.DTOs.Projects;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;
using Xunit;

namespace TaskManagement.Tests.Services;

public class ProjectServiceTests
{
    private readonly Mock<IProjectRepository> _projectRepoMock;
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly ProjectService _projectService;

    public ProjectServiceTests()
    {
        _projectRepoMock = new Mock<IProjectRepository>();
        _userRepoMock = new Mock<IUserRepository>();
        _projectService = new ProjectService(_projectRepoMock.Object, _userRepoMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenProjectExists_ReturnsProjectResponse()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Project
        {
            Id = projectId,
            Name = "Alpha Project",
            Description = "Alpha Description",
            CreatedAt = DateTime.UtcNow
        };

        _projectRepoMock.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync(project);

        // Act
        var result = await _projectService.GetByIdAsync(projectId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(projectId);
        result.Name.Should().Be("Alpha Project");
    }

    [Fact]
    public async Task GetByIdAsync_WhenProjectDoesNotExist_ThrowsKeyNotFoundException()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        _projectRepoMock.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync((Project?)null);

        // Act
        var act = async () => await _projectService.GetByIdAsync(projectId);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"*{projectId}*");
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_CreatesAndReturnsProjectResponse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new CreateProjectRequest
        {
            Name = "New Initiative",
            Description = "Initiative Description"
        };

        _projectRepoMock.Setup(r => r.CreateAsync(It.IsAny<Project>()))
            .ReturnsAsync((Project p) => p);

        // Act
        var result = await _projectService.CreateAsync(request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name);
        result.Description.Should().Be(request.Description);
        _projectRepoMock.Verify(r => r.CreateAsync(It.Is<Project>(p => p.Name == request.Name && p.CreatedByUserId == userId)), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenProjectExists_CallsRepositoryDelete()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        _projectRepoMock.Setup(r => r.ExistsAsync(projectId)).ReturnsAsync(true);
        _projectRepoMock.Setup(r => r.DeleteAsync(projectId)).Returns(Task.CompletedTask);

        // Act
        await _projectService.DeleteAsync(projectId);

        // Assert
        _projectRepoMock.Verify(r => r.DeleteAsync(projectId), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenProjectDoesNotExist_ThrowsKeyNotFoundException()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        _projectRepoMock.Setup(r => r.ExistsAsync(projectId)).ReturnsAsync(false);

        // Act
        var act = async () => await _projectService.DeleteAsync(projectId);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}

