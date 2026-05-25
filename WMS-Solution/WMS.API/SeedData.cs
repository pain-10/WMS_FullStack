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
        if (!await db.Roles.AnyAsync(r => r.RoleName == "Admin"))
            db.Roles.Add(new Role { RoleName = "Admin" });

        if (!await db.Roles.AnyAsync(r => r.RoleName == "Manager"))
            db.Roles.Add(new Role { RoleName = "Manager" });

        if (!await db.Roles.AnyAsync(r => r.RoleName == "Employee"))
            db.Roles.Add(new Role { RoleName = "Employee" });

        await db.SaveChangesAsync();
    }

    private static async Task EnsureDepartmentsExistAsync(WmsDbContext db)
    {
        if (!await db.Departments.AnyAsync(d => d.DepartmentName == "HR"))
            db.Departments.Add(new Department { DepartmentName = "HR", CreatedOn = DateTime.UtcNow });

        if (!await db.Departments.AnyAsync(d => d.DepartmentName == "IT"))
            db.Departments.Add(new Department { DepartmentName = "IT", CreatedOn = DateTime.UtcNow });

        if (!await db.Departments.AnyAsync(d => d.DepartmentName == "Finance"))
            db.Departments.Add(new Department { DepartmentName = "Finance", CreatedOn = DateTime.UtcNow });

        await db.SaveChangesAsync();
    }

    private static async Task EnsureAdminAccountAsync(WmsDbContext db)
    {
        if (await db.UserLogins.AnyAsync(u => u.Username == "Admin"))
            return;

        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.RoleName == "Admin");
        if (adminRole == null)
            throw new InvalidOperationException("Admin role not found — EnsureRolesExistAsync must run first.");

        var dept = await db.Departments.FirstOrDefaultAsync();
        if (dept == null)
            throw new InvalidOperationException("No departments found — EnsureDepartmentsExistAsync must run first.");

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

        if (!await db.UserLogins.AnyAsync(u => u.Username == "Admin"))
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
