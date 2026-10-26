using TaskManagement.Application.DTOs.Users;

namespace TaskManagement.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync();
    Task<UserResponse?> GetByIdAsync(Guid id);
    Task<UserResponse> UpdateRoleAsync(Guid id, int newRole, Guid currentAdminUserId);
    Task DeleteAsync(Guid id, Guid currentAdminUserId);
}

