using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.Common;
using TaskManagement.Application.DTOs.Projects;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// Get all projects (paginated)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ProjectResponse>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _projectService.GetAllAsync(page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Get project by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectResponse>> GetById(Guid id)
    {
        var result = await _projectService.GetByIdAsync(id);
        return Ok(result);
    }

    /// <summary>
    /// Create a new project (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectResponse>> Create([FromBody] CreateProjectRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _projectService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update a project (Admin only)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectResponse>> Update(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var result = await _projectService.UpdateAsync(id, request);
        return Ok(result);
    }

    /// <summary>
    /// Delete a project (Admin only)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _projectService.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Get members of a project
    /// </summary>
    [HttpGet("{id:guid}/members")]
    [ProducesResponseType(typeof(IEnumerable<ProjectMemberResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProjectMemberResponse>>> GetMembers(Guid id)
    {
        var result = await _projectService.GetMembersAsync(id);
        return Ok(result);
    }

    /// <summary>
    /// Add a member to a project (Admin only)
    /// </summary>
    [HttpPost("{id:guid}/members")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddMemberRequest request)
    {
        await _projectService.AddMemberAsync(id, request);
        return NoContent();
    }

    /// <summary>
    /// Remove a member from a project (Admin only)
    /// </summary>
    [HttpDelete("{id:guid}/members/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId)
    {
        await _projectService.RemoveMemberAsync(id, userId);
        return NoContent();
    }
}

