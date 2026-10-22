using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
            return;

        // User IDs
        var adminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var memberUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        // Project IDs
        var project1Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var project2Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        // Task IDs
        var task1Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccc01");
        var task2Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccc02");
        var task3Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccc03");
        var task4Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccc04");
        var task5Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccc05");
        var task6Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccc06");

        // Seed Users
        var adminUser = new User
        {
            Id = adminUserId,
            FullName = "Admin User",
            Email = "admin@taskmanager.com",
            // Pre-hashed password for seeding. Password: Admin@123
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var memberUser = new User
        {
            Id = memberUserId,
            FullName = "John Member",
            Email = "john@taskmanager.com",
            // Pre-hashed password for seeding. Password: Member@123
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Member@123"),
            Role = UserRole.Member,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(adminUser, memberUser);

        // Seed Projects
        var project1 = new Project
        {
            Id = project1Id,
            Name = "Website Redesign",
            Description = "Complete overhaul of the company website with modern design",
            CreatedByUserId = adminUserId,
            CreatedAt = DateTime.UtcNow
        };

        var project2 = new Project
        {
            Id = project2Id,
            Name = "Mobile App Development",
            Description = "Cross-platform mobile application for customer engagement",
            CreatedByUserId = adminUserId,
            CreatedAt = DateTime.UtcNow
        };

        context.Projects.AddRange(project1, project2);

        // Seed Project Members
        var projectMembers = new List<ProjectMember>
        {
            new() { ProjectId = project1Id, UserId = adminUserId, JoinedAt = DateTime.UtcNow },
            new() { ProjectId = project2Id, UserId = adminUserId, JoinedAt = DateTime.UtcNow },
            new() { ProjectId = project1Id, UserId = memberUserId, JoinedAt = DateTime.UtcNow }
        };

        context.ProjectMembers.AddRange(projectMembers);

        // Seed Tasks
        var tasks = new List<TaskItem>
        {
            new()
            {
                Id = task1Id,
                Title = "Design new homepage layout",
                Description = "Create wireframes and mockups for the new homepage",
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.High,
                DueDate = DateTime.UtcNow.AddDays(7),
                ProjectId = project1Id,
                AssignedToUserId = memberUserId,
                CreatedByUserId = adminUserId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = task2Id,
                Title = "Implement responsive navigation",
                Description = "Build a mobile-friendly navigation menu",
                Status = TaskItemStatus.ToDo,
                Priority = TaskPriority.Medium,
                DueDate = DateTime.UtcNow.AddDays(14),
                ProjectId = project1Id,
                AssignedToUserId = memberUserId,
                CreatedByUserId = adminUserId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = task3Id,
                Title = "Set up CI/CD pipeline",
                Description = "Configure automated build and deployment pipeline",
                Status = TaskItemStatus.Done,
                Priority = TaskPriority.High,
                DueDate = DateTime.UtcNow.AddDays(-2),
                ProjectId = project1Id,
                AssignedToUserId = adminUserId,
                CreatedByUserId = adminUserId,
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new()
            {
                Id = task4Id,
                Title = "Design app wireframes",
                Description = "Create initial wireframes for the mobile application",
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.High,
                DueDate = DateTime.UtcNow.AddDays(5),
                ProjectId = project2Id,
                AssignedToUserId = adminUserId,
                CreatedByUserId = adminUserId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = task5Id,
                Title = "Set up React Native project",
                Description = "Initialize the React Native project with required dependencies",
                Status = TaskItemStatus.ToDo,
                Priority = TaskPriority.Medium,
                DueDate = DateTime.UtcNow.AddDays(10),
                ProjectId = project2Id,
                AssignedToUserId = null,
                CreatedByUserId = adminUserId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = task6Id,
                Title = "API integration planning",
                Description = "Plan the API endpoints needed for the mobile app",
                Status = TaskItemStatus.ToDo,
                Priority = TaskPriority.Low,
                DueDate = DateTime.UtcNow.AddDays(21),
                ProjectId = project2Id,
                AssignedToUserId = adminUserId,
                CreatedByUserId = adminUserId,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Tasks.AddRange(tasks);

        // Seed Task Comments
        var comments = new List<TaskComment>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Content = "Started working on the homepage layout. Will share the first draft by EOD.",
                TaskId = task1Id,
                UserId = memberUserId,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new()
            {
                Id = Guid.NewGuid(),
                Content = "CI/CD pipeline is up and running. All tests passing on the main branch.",
                TaskId = task3Id,
                UserId = adminUserId,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        context.TaskComments.AddRange(comments);

        await context.SaveChangesAsync();
    }
}
