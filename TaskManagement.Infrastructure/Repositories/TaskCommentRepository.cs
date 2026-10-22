using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Repositories;

public class TaskCommentRepository : ITaskCommentRepository
{
    private readonly AppDbContext _context;

    public TaskCommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskComment?> GetByIdAsync(Guid id)
    {
        return await _context.TaskComments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<TaskComment>> GetByTaskIdAsync(Guid taskId)
    {
        return await _context.TaskComments
            .Where(c => c.TaskId == taskId)
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<TaskComment> CreateAsync(TaskComment comment)
    {
        _context.TaskComments.Add(comment);
        await _context.SaveChangesAsync();
        return comment;
    }

    public async Task DeleteAsync(Guid id)
    {
        var comment = await _context.TaskComments.FindAsync(id);
        if (comment is not null)
        {
            _context.TaskComments.Remove(comment);
            await _context.SaveChangesAsync();
        }
    }
}
