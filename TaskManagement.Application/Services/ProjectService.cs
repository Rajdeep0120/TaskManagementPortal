using TaskManagement.Application.DTOs.Common;
using TaskManagement.Application.DTOs.Projects;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Mappings;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;

    public ProjectService(IProjectRepository projectRepository, IUserRepository userRepository)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
    }

    public async Task<ProjectResponse> GetByIdAsync(Guid id)
    {
        var project = await _projectRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Project with ID '{id}' was not found.");

        return project.ToResponse();
    }

    public async Task<PagedResult<ProjectResponse>> GetAllAsync(int page, int pageSize)
    {
        var (items, totalCount) = await _projectRepository.GetAllAsync(page, pageSize);

        return new PagedResult<ProjectResponse>
        {
            Items = items.Select(p => p.ToResponse()),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request, Guid createdByUserId)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _projectRepository.CreateAsync(project);

        return project.ToResponse();
    }

    public async Task<ProjectResponse> UpdateAsync(Guid id, UpdateProjectRequest request)
    {
        var project = await _projectRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Project with ID '{id}' was not found.");

        project.Name = request.Name;
        project.Description = request.Description;
        project.UpdatedAt = DateTime.UtcNow;

        await _projectRepository.UpdateAsync(project);

        return project.ToResponse();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await _projectRepository.ExistsAsync(id))
            throw new KeyNotFoundException($"Project with ID '{id}' was not found.");

        await _projectRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<ProjectMemberResponse>> GetMembersAsync(Guid projectId)
    {
        var members = await _projectRepository.GetMembersAsync(projectId);
        return members.Select(m => m.ToResponse());
    }

    public async Task AddMemberAsync(Guid projectId, AddMemberRequest request)
    {
        if (!await _projectRepository.ExistsAsync(projectId))
            throw new KeyNotFoundException($"Project with ID '{projectId}' was not found.");

        if (!await _userRepository.ExistsAsync(request.UserId))
            throw new KeyNotFoundException($"User with ID '{request.UserId}' was not found.");

        if (await _projectRepository.IsMemberAsync(projectId, request.UserId))
            throw new InvalidOperationException("User is already a member of this project.");

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = request.UserId,
            JoinedAt = DateTime.UtcNow
        };

        await _projectRepository.AddMemberAsync(member);
    }

    public async Task RemoveMemberAsync(Guid projectId, Guid userId)
    {
        await _projectRepository.RemoveMemberAsync(projectId, userId);
    }
}
