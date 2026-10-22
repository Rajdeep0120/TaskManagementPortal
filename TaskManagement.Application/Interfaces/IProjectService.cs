using TaskManagement.Application.DTOs.Common;
using TaskManagement.Application.DTOs.Projects;

namespace TaskManagement.Application.Interfaces;

public interface IProjectService
{
    Task<ProjectResponse> GetByIdAsync(Guid id);
    Task<PagedResult<ProjectResponse>> GetAllAsync(int page, int pageSize);
    Task<ProjectResponse> CreateAsync(CreateProjectRequest request, Guid createdByUserId);
    Task<ProjectResponse> UpdateAsync(Guid id, UpdateProjectRequest request);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<ProjectMemberResponse>> GetMembersAsync(Guid projectId);
    Task AddMemberAsync(Guid projectId, AddMemberRequest request);
    Task RemoveMemberAsync(Guid projectId, Guid userId);
}
