using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.Reports;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Get task count per user grouped by status (uses raw SQL / Dapper)
    /// </summary>
    [HttpGet("tasks-per-user")]
    [ProducesResponseType(typeof(IEnumerable<TasksPerUserReportItem>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TasksPerUserReportItem>>> GetTasksPerUser()
    {
        var result = await _reportService.GetTasksPerUserReportAsync();
        return Ok(result);
    }
}

