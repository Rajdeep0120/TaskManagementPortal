using System.Security.Claims;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;
using Xunit;

namespace TaskManagement.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _configMock = new Mock<IConfiguration>();

        _configMock.Setup(c => c["Jwt:Secret"]).Returns("ThisIsAVerySecureKeyForTestingPurposes1234567890!");
        _configMock.Setup(c => c["Jwt:Issuer"]).Returns("TaskManagement.Api");
        _configMock.Setup(c => c["Jwt:Audience"]).Returns("TaskManagement.Client");

        _authService = new AuthService(_userRepoMock.Object, _configMock.Object);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var password = "SecurePassword123!";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            FullName = "Test User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Member
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

        var request = new LoginRequest { Email = user.Email, Password = password };

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(user.Email);
        result.FullName.Should().Be(user.FullName);
        result.Role.Should().Be("Member");
        result.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task LoginAsync_WithIncorrectPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            FullName = "Test User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
            Role = UserRole.Member
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

        var request = new LoginRequest { Email = user.Email, Password = "WrongPassword" };

        // Act
        var act = async () => await _authService.LoginAsync(request);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    [Fact]
    public async Task LoginAsync_WithNonExistentEmail_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        var request = new LoginRequest { Email = "nonexistent@test.com", Password = "password" };

        // Act
        var act = async () => await _authService.LoginAsync(request);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    [Fact]
    public async Task RegisterAsync_WithNewEmail_CreatesUserAndReturnsToken()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "New User",
            Email = "newuser@test.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        _userRepoMock.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(false);
        _userRepoMock.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(request.Email);
        result.FullName.Should().Be(request.FullName);
        result.Token.Should().NotBeNullOrWhiteSpace();
        _userRepoMock.Verify(r => r.CreateAsync(It.Is<User>(u => u.Email == request.Email && u.FullName == request.FullName)), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Existing User",
            Email = "existing@test.com",
            Password = "Password123!"
        };

        _userRepoMock.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(true);

        // Act
        var act = async () => await _authService.RegisterAsync(request);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Email is already registered.");
    }
}
