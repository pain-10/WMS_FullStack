using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Context;

namespace WMS.API;

public static class SeedData
{
    public static async Task SeedDevelopmentDataAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WmsDbContext>();

        await EnsureRolesExistAsync(db);
        await EnsureDepartmentsExistAsync(db);
        await EnsureAdminAccountAsync(db);
    }

    private static async Task EnsureRolesExistAsync(WmsDbContext db)
    {
        var existing = await db.Roles
            .GroupBy(r => r.RoleName)
            .Select(g => g.First())
            .ToListAsync();

        var names = new HashSet<string>(existing.Select(r => r.RoleName), StringComparer.OrdinalIgnoreCase);

        if (!names.Contains("Admin"))
            db.Roles.Add(new Role { RoleName = "Admin" });

        if (!names.Contains("Manager"))
            db.Roles.Add(new Role { RoleName = "Manager" });

        if (!names.Contains("Employee"))
            db.Roles.Add(new Role { RoleName = "Employee" });

        await db.SaveChangesAsync();
    }

    private static async Task EnsureDepartmentsExistAsync(WmsDbContext db)
    {
        var existing = await db.Departments
            .GroupBy(d => d.DepartmentName)
            .Select(g => g.First())
            .ToListAsync();

        var names = new HashSet<string>(existing.Select(d => d.DepartmentName), StringComparer.OrdinalIgnoreCase);

        if (!names.Contains("HR"))
            db.Departments.Add(new Department { DepartmentName = "HR", CreatedOn = DateTime.UtcNow });

        if (!names.Contains("IT"))
            db.Departments.Add(new Department { DepartmentName = "IT", CreatedOn = DateTime.UtcNow });

        if (!names.Contains("Finance"))
            db.Departments.Add(new Department { DepartmentName = "Finance", CreatedOn = DateTime.UtcNow });

        await db.SaveChangesAsync();
    }

    private static async Task EnsureAdminAccountAsync(WmsDbContext db)
    {
        var adminLogin = await db.UserLogins.FirstOrDefaultAsync(u => u.Username == "Admin");
        if (adminLogin != null)
            return;

        var adminRole = await db.Roles
            .GroupBy(r => r.RoleName)
            .Select(g => g.First())
            .FirstAsync(r => r.RoleName == "Admin");

        var dept = await db.Departments
            .OrderBy(d => d.DepartmentId)
            .FirstAsync();

        var adminEmployee = await db.Employees.FirstOrDefaultAsync(e => e.Email == "admin@example.com");
        if (adminEmployee == null)
        {
            adminEmployee = new Employee
            {
                FirstName = "System",
                LastName = "Admin",
                Email = "admin@example.com",
                PhoneNumber = "9999999999",
                Gender = 'O',
                DOB = DateTime.UtcNow.AddYears(-30),
                DOJ = DateTime.UtcNow.Date,
                DepartmentId = dept.DepartmentId,
                RoleId = adminRole.RoleId,
                Status = "Active",
                CreatedOn = DateTime.UtcNow,
            };
            db.Employees.Add(adminEmployee);
            await db.SaveChangesAsync();
        }

        var userLogin = await db.UserLogins.FirstOrDefaultAsync(u => u.Username == "Admin");
        if (userLogin == null)
        {
            db.UserLogins.Add(new UserLogin
            {
                Username = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                EmployeeId = adminEmployee.EmployeeId,
                RoleId = adminRole.RoleId,
            });
            await db.SaveChangesAsync();
        }
    }
}
