using FluentAssertions;
using Moq;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;
using Xunit;

namespace TaskManagement.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _userService = new UserService(_userRepoMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllUsers()
    {
        // Arrange
        var users = new List<User>
        {
            new() { Id = Guid.NewGuid(), FullName = "Admin", Email = "admin@test.com", Role = UserRole.Admin },
            new() { Id = Guid.NewGuid(), FullName = "John", Email = "john@test.com", Role = UserRole.Member }
        };

        _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(users);

        // Act
        var result = await _userService.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task UpdateRoleAsync_ValidPromotion_UpdatesRole()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var user = new User { Id = targetUserId, FullName = "John", Email = "john@test.com", Role = UserRole.Member };

        _userRepoMock.Setup(r => r.GetByIdAsync(targetUserId)).ReturnsAsync(user);

        // Act
        var result = await _userService.UpdateRoleAsync(targetUserId, (int)UserRole.Admin, adminId);

        // Assert
        result.Role.Should().Be("Admin");
        user.Role.Should().Be(UserRole.Admin);
        _userRepoMock.Verify(r => r.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task UpdateRoleAsync_AdminRevokingOwnRole_ThrowsException()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var admin = new User { Id = adminId, FullName = "Admin", Email = "admin@test.com", Role = UserRole.Admin };

        _userRepoMock.Setup(r => r.GetByIdAsync(adminId)).ReturnsAsync(admin);

        // Act
        var act = () => _userService.UpdateRoleAsync(adminId, (int)UserRole.Member, adminId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("You cannot revoke your own Admin role.");
    }

    [Fact]
    public async Task DeleteAsync_SelfDeletion_ThrowsException()
    {
        // Arrange
        var adminId = Guid.NewGuid();

        // Act
        var act = () => _userService.DeleteAsync(adminId, adminId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("You cannot delete your own account.");
    }

    [Fact]
    public async Task DeleteAsync_UserWithAuthoredProjectsOrTasks_ThrowsException()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();

        _userRepoMock.Setup(r => r.ExistsAsync(targetUserId)).ReturnsAsync(true);
        _userRepoMock.Setup(r => r.HasCreatedProjectsOrTasksAsync(targetUserId)).ReturnsAsync(true);

        // Act
        var act = () => _userService.DeleteAsync(targetUserId, adminId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*authored active projects or tasks*");
    }

    [Fact]
    public async Task DeleteAsync_ValidUser_CallsDeleteAsync()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();

        _userRepoMock.Setup(r => r.ExistsAsync(targetUserId)).ReturnsAsync(true);
        _userRepoMock.Setup(r => r.HasCreatedProjectsOrTasksAsync(targetUserId)).ReturnsAsync(false);

        // Act
        await _userService.DeleteAsync(targetUserId, adminId);

        // Assert
        _userRepoMock.Verify(r => r.DeleteAsync(targetUserId), Times.Once);
    }
}

