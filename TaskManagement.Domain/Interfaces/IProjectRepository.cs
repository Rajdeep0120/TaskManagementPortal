using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces;

public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(Guid id);
    Task<(IEnumerable<Project> Items, int TotalCount)> GetAllAsync(int page, int pageSize);
    Task<Project> CreateAsync(Project project);
    Task UpdateAsync(Project project);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<IEnumerable<ProjectMember>> GetMembersAsync(Guid projectId);
    Task AddMemberAsync(ProjectMember member);
    Task RemoveMemberAsync(Guid projectId, Guid userId);
    Task<bool> IsMemberAsync(Guid projectId, Guid userId);
}

