using TaskManagement.Application.DTOs.Users;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserResponse>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => new UserResponse
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Role = u.Role.ToString(),
            CreatedAt = u.CreatedAt
        });
    }

    public async Task<UserResponse?> GetByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return null;
        }

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserResponse> UpdateRoleAsync(Guid id, int newRole, Guid currentAdminUserId)
    {
        if (!Enum.IsDefined(typeof(UserRole), newRole))
        {
            throw new ArgumentException("Invalid role specified. Role must be 0 (Member) or 1 (Admin).");
        }

        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"User with ID '{id}' was not found.");

        if (id == currentAdminUserId && (UserRole)newRole != UserRole.Admin)
        {
            throw new InvalidOperationException("You cannot revoke your own Admin role.");
        }

        user.Role = (UserRole)newRole;
        await _userRepository.UpdateAsync(user);

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        };
    }

    public async Task DeleteAsync(Guid id, Guid currentAdminUserId)
    {
        if (id == currentAdminUserId)
        {
            throw new InvalidOperationException("You cannot delete your own account.");
        }

        if (!await _userRepository.ExistsAsync(id))
        {
            throw new KeyNotFoundException($"User with ID '{id}' was not found.");
        }

        if (await _userRepository.HasCreatedProjectsOrTasksAsync(id))
        {
            throw new InvalidOperationException("Cannot delete this user because they have authored active projects or tasks. Please reassign or delete their authored items first.");
        }

        await _userRepository.DeleteAsync(id);
    }
}

