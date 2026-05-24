using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;

namespace WMS.Infrastructure.Context;

public class WmsDbContext : DbContext
{
    public WmsDbContext(
        DbContextOptions<WmsDbContext> options)
        : base(options)
    {
    }

    // Employee Management
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Role> Roles { get; set; }

    // Attendance Management
    public DbSet<Attendance> Attendances { get; set; }

    // Leave Management
    public DbSet<Leave> Leaves { get; set; }

    // Notice Board
    public DbSet<Announcement> Announcements { get; set; }

    // Project Management
    public DbSet<Project> Projects { get; set; }
    public DbSet<Client> Clients { get; set; }

    public DbSet<EmployeeProjectAllocation>
        EmployeeProjectAllocations { get; set; }

    // Authentication
    public DbSet<UserLogin> UserLogins { get; set; }

    // Audit Tracking
    public DbSet<AuditLog> AuditLogs { get; set; }

    // Notifications
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UserLogin → Employee relationship
        modelBuilder.Entity<UserLogin>()
            .HasOne(u => u.Employee)
            .WithMany()
            .HasForeignKey(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        // Employee Email Unique
        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.Email)
            .IsUnique();

        // Username Unique
        modelBuilder.Entity<UserLogin>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Department Seed Data
        modelBuilder.Entity<Department>()
            .HasData(
                new Department
                {
                    DepartmentId = 1,
                    DepartmentName = "HR"
                },
                new Department
                {
                    DepartmentId = 2,
                    DepartmentName = "IT"
                },
                new Department
                {
                    DepartmentId = 3,
                    DepartmentName = "Finance"
                }
            );

        // Role Seed Data
        modelBuilder.Entity<Role>()
            .HasData(
                new Role
                {
                    RoleId = 1,
                    RoleName = "Admin"
                },
                new Role
                {
                    RoleId = 2,
                    RoleName = "Manager"
                },
                new Role
                {
                    RoleId = 3,
                    RoleName = "Employee"
                }
            );
    }
}