using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using TaskManagement.Application.DTOs.Reports;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Infrastructure.Reports;

public class DapperReportRepository : IReportService
{
    private readonly IConfiguration _configuration;

    public DapperReportRepository(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<IEnumerable<TasksPerUserReportItem>> GetTasksPerUserReportAsync()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        await using var connection = new NpgsqlConnection(connectionString);

        const string sql = """
            SELECT 
                u."Id" AS UserId,
                u."FullName",
                u."Email",
                COUNT(CASE WHEN t."Status" = 0 THEN 1 END) AS ToDoCount,
                COUNT(CASE WHEN t."Status" = 1 THEN 1 END) AS InProgressCount,
                COUNT(CASE WHEN t."Status" = 2 THEN 1 END) AS DoneCount,
                COUNT(t."Id") AS TotalCount
            FROM "Users" u
            LEFT JOIN "Tasks" t ON u."Id" = t."AssignedToUserId"
            GROUP BY u."Id", u."FullName", u."Email"
            ORDER BY COUNT(t."Id") DESC
            """;

        var results = await connection.QueryAsync<TasksPerUserReportItem>(sql);
        return results;
    }
}
