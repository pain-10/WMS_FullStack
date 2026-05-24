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

        var existingEmployees = await db.Employees.CountAsync();
        if (existingEmployees > 4)
        {
            return;
        }

        var roles = await db.Roles.ToDictionaryAsync(r => r.RoleName);
        var departments = await db.Departments.ToDictionaryAsync(d => d.DepartmentName);

        if (!departments.ContainsKey("Operations"))
        {
            var ops = new Department { DepartmentName = "Operations", CreatedOn = DateTime.UtcNow };
            db.Departments.Add(ops);
            await db.SaveChangesAsync();
            departments = await db.Departments.ToDictionaryAsync(d => d.DepartmentName);
        }

        if (!departments.ContainsKey("Marketing"))
        {
            var mkt = new Department { DepartmentName = "Marketing", CreatedOn = DateTime.UtcNow };
            db.Departments.Add(mkt);
            await db.SaveChangesAsync();
            departments = await db.Departments.ToDictionaryAsync(d => d.DepartmentName);
        }

        var adminEmployee = await db.Employees
            .FirstAsync(e => e.RoleId == roles["Admin"].RoleId);
        var adminUserId = adminEmployee.EmployeeId;

        var rng = new Random(42);
        var today = DateTime.UtcNow.Date;
        var employeeRoleId = roles["Employee"].RoleId;

        var employeeInfos = new[]
        {
            // HR (4)
            new { First = "James", Last = "Wilson", Gender = 'M', Dept = "HR", Status = "Active", DOB = new DateTime(1995, 3, 12), DOJ = new DateTime(2024, 1, 15) },
            new { First = "Mary", Last = "Johnson", Gender = 'F', Dept = "HR", Status = "Active", DOB = new DateTime(1997, 7, 24), DOJ = new DateTime(2024, 3, 1) },
            new { First = "Robert", Last = "Brown", Gender = 'M', Dept = "HR", Status = "Active", DOB = new DateTime(1993, 11, 8), DOJ = new DateTime(2023, 6, 12) },
            new { First = "Patricia", Last = "Davis", Gender = 'F', Dept = "HR", Status = "Active", DOB = new DateTime(1996, 5, 19), DOJ = new DateTime(2025, 1, 10) },
            // IT (8)
            new { First = "Michael", Last = "Smith", Gender = 'M', Dept = "IT", Status = "Active", DOB = new DateTime(1994, 9, 3), DOJ = new DateTime(2023, 9, 5) },
            new { First = "Jennifer", Last = "Williams", Gender = 'F', Dept = "IT", Status = "Active", DOB = new DateTime(1998, 2, 14), DOJ = new DateTime(2024, 7, 22) },
            new { First = "David", Last = "Miller", Gender = 'M', Dept = "IT", Status = "Active", DOB = new DateTime(1992, 6, 28), DOJ = new DateTime(2023, 4, 18) },
            new { First = "Linda", Last = "Garcia", Gender = 'F', Dept = "IT", Status = "Active", DOB = new DateTime(1995, 12, 5), DOJ = new DateTime(2024, 11, 1) },
            new { First = "William", Last = "Martinez", Gender = 'M', Dept = "IT", Status = "Active", DOB = new DateTime(1997, 8, 16), DOJ = new DateTime(2025, 2, 20) },
            new { First = "Barbara", Last = "Anderson", Gender = 'F', Dept = "IT", Status = "Active", DOB = new DateTime(1993, 4, 30), DOJ = new DateTime(2023, 11, 15) },
            new { First = "Richard", Last = "Taylor", Gender = 'M', Dept = "IT", Status = "Active", DOB = new DateTime(1996, 10, 22), DOJ = new DateTime(2024, 5, 8) },
            new { First = "Elizabeth", Last = "Thomas", Gender = 'F', Dept = "IT", Status = "Inactive", DOB = new DateTime(1991, 1, 9), DOJ = new DateTime(2023, 3, 1) },
            // Finance (5)
            new { First = "Joseph", Last = "Hernandez", Gender = 'M', Dept = "Finance", Status = "Active", DOB = new DateTime(1994, 8, 7), DOJ = new DateTime(2024, 2, 12) },
            new { First = "Susan", Last = "Moore", Gender = 'F', Dept = "Finance", Status = "Active", DOB = new DateTime(1998, 11, 25), DOJ = new DateTime(2025, 3, 5) },
            new { First = "Thomas", Last = "Jackson", Gender = 'M', Dept = "Finance", Status = "Active", DOB = new DateTime(1993, 5, 14), DOJ = new DateTime(2023, 8, 20) },
            new { First = "Jessica", Last = "Martin", Gender = 'F', Dept = "Finance", Status = "Active", DOB = new DateTime(1996, 3, 2), DOJ = new DateTime(2024, 9, 10) },
            new { First = "Charles", Last = "Lee", Gender = 'M', Dept = "Finance", Status = "Inactive", DOB = new DateTime(1990, 12, 20), DOJ = new DateTime(2023, 1, 5) },
            // Operations (6)
            new { First = "Christopher", Last = "White", Gender = 'M', Dept = "Operations", Status = "Active", DOB = new DateTime(1995, 7, 11), DOJ = new DateTime(2024, 4, 1) },
            new { First = "Sarah", Last = "Harris", Gender = 'F', Dept = "Operations", Status = "Active", DOB = new DateTime(1997, 9, 28), DOJ = new DateTime(2024, 8, 15) },
            new { First = "Daniel", Last = "Clark", Gender = 'M', Dept = "Operations", Status = "Active", DOB = new DateTime(1994, 2, 17), DOJ = new DateTime(2023, 10, 5) },
            new { First = "Karen", Last = "Lewis", Gender = 'F', Dept = "Operations", Status = "Active", DOB = new DateTime(1998, 6, 4), DOJ = new DateTime(2025, 1, 25) },
            new { First = "Matthew", Last = "Robinson", Gender = 'M', Dept = "Operations", Status = "Inactive", DOB = new DateTime(1992, 10, 13), DOJ = new DateTime(2023, 5, 22) },
            new { First = "Lisa", Last = "Walker", Gender = 'F', Dept = "Operations", Status = "Active", DOB = new DateTime(1996, 4, 21), DOJ = new DateTime(2024, 6, 10) },
            // Marketing (7)
            new { First = "Anthony", Last = "Young", Gender = 'M', Dept = "Marketing", Status = "Active", DOB = new DateTime(1995, 1, 26), DOJ = new DateTime(2024, 3, 18) },
            new { First = "Nancy", Last = "Allen", Gender = 'F', Dept = "Marketing", Status = "Active", DOB = new DateTime(1997, 12, 15), DOJ = new DateTime(2024, 10, 1) },
            new { First = "Steven", Last = "King", Gender = 'M', Dept = "Marketing", Status = "Active", DOB = new DateTime(1993, 8, 9), DOJ = new DateTime(2023, 7, 14) },
            new { First = "Sandra", Last = "Wright", Gender = 'F', Dept = "Marketing", Status = "Active", DOB = new DateTime(1998, 3, 31), DOJ = new DateTime(2025, 2, 10) },
            new { First = "Andrew", Last = "Scott", Gender = 'M', Dept = "Marketing", Status = "Active", DOB = new DateTime(1994, 6, 18), DOJ = new DateTime(2024, 12, 2) },
            new { First = "Betty", Last = "Green", Gender = 'F', Dept = "Marketing", Status = "Inactive", DOB = new DateTime(1991, 9, 7), DOJ = new DateTime(2023, 2, 20) },
            new { First = "Margaret", Last = "Baker", Gender = 'F', Dept = "Marketing", Status = "Active", DOB = new DateTime(1996, 11, 29), DOJ = new DateTime(2024, 5, 5) },
        };

        var createdEmployees = new List<Employee>();
        var createdUserLogins = new List<UserLogin>();

        foreach (var info in employeeInfos)
        {
            var email = $"{info.First.ToLower()}.{info.Last.ToLower()}@wms.local";
            var username = $"{info.First.ToLower()}.{info.Last.ToLower()}";

            var existing = await db.Employees.FirstOrDefaultAsync(e => e.Email == email);
            if (existing != null)
            {
                createdEmployees.Add(existing);
                continue;
            }

            var employee = new Employee
            {
                FirstName = info.First,
                LastName = info.Last,
                Email = email,
                PhoneNumber = $"{rng.Next(100, 999)}{rng.Next(100, 999)}{rng.Next(1000, 9999)}",
                Gender = info.Gender,
                DOB = info.DOB,
                DOJ = info.DOJ,
                DepartmentId = departments[info.Dept].DepartmentId,
                RoleId = employeeRoleId,
                Status = info.Status,
                CreatedOn = info.DOJ,
            };

            db.Employees.Add(employee);
            await db.SaveChangesAsync();
            createdEmployees.Add(employee);

            var userLogin = new UserLogin
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                EmployeeId = employee.EmployeeId,
                RoleId = employeeRoleId,
            };

            db.UserLogins.Add(userLogin);
            createdUserLogins.Add(userLogin);
        }

        await db.SaveChangesAsync();

        var activeEmployees = createdEmployees.Where(e => e.Status == "Active").ToList();
        var inactiveEmployees = createdEmployees.Where(e => e.Status == "Inactive").ToList();

        var clients = new List<Client>();
        var clientNames = new[] { "Infosys", "TCS", "Google", "Microsoft", "Amazon" };
        var clientLocations = new[] { "Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai" };
        var clientAddresses = new[]
        {
            "Electronics City Phase 1, Bangalore",
            "TCS House, Ravi Kumar Patil Marg, Mumbai",
            "Googleplex, Sarjapur Road, Hyderabad",
            "Microsoft Campus, Hinjewadi, Pune",
            "Amazon Tower, Old Mahabalipuram Road, Chennai",
        };

        for (int i = 0; i < clientNames.Length; i++)
        {
            var existingClient = await db.Clients.FirstOrDefaultAsync(c => c.ClientName == clientNames[i]);
            if (existingClient == null)
            {
                var client = new Client
                {
                    ClientName = clientNames[i],
                    ClientAddress = clientAddresses[i],
                    ClientPhoneNumber = $"{rng.Next(100, 999)}{rng.Next(100, 999)}{rng.Next(1000, 9999)}",
                    ClientLocation = clientLocations[i],
                    Status = true,
                };
                db.Clients.Add(client);
                clients.Add(client);
            }
            else
            {
                clients.Add(existingClient);
            }
        }

        await db.SaveChangesAsync();

        var dbClients = await db.Clients.ToListAsync();

        var projectInfos = new[]
        {
            new { Name = "Project Alpha", ClientIdx = 0, Status = "Active", Start = today.AddMonths(-8), End = (DateTime?)null },
            new { Name = "Project Beta", ClientIdx = 1, Status = "Active", Start = today.AddMonths(-6), End = (DateTime?)null },
            new { Name = "Project Gamma", ClientIdx = 2, Status = "Active", Start = today.AddMonths(-10), End = (DateTime?)null },
            new { Name = "Project Delta", ClientIdx = 3, Status = "Completed", Start = today.AddMonths(-14), End = (DateTime?)today.AddMonths(-2) },
            new { Name = "Project Omega", ClientIdx = 4, Status = "Active", Start = today.AddMonths(-4), End = (DateTime?)null },
        };

        var projects = new List<Project>();
        foreach (var pi in projectInfos)
        {
            var existingProject = await db.Projects.FirstOrDefaultAsync(p => p.ProjectName == pi.Name);
            if (existingProject == null)
            {
                var project = new Project
                {
                    ProjectName = pi.Name,
                    ClientId = dbClients[pi.ClientIdx].ClientId,
                    StartDate = pi.Start,
                    EndDate = pi.End,
                    Status = pi.Status,
                };
                db.Projects.Add(project);
                projects.Add(project);
            }
            else
            {
                projects.Add(existingProject);
            }
        }

        await db.SaveChangesAsync();

        var dbProjects = await db.Projects.ToListAsync();

        var attendanceRecords = new List<Attendance>();
        for (int i = 60; i >= 1; i--)
        {
            var date = today.AddDays(-i);
            if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
            {
                continue;
            }

            foreach (var emp in activeEmployees)
            {
                if (rng.NextDouble() >= 0.82)
                {
                    continue;
                }

                var checkInHour = 8 + rng.Next(0, 3);
                var checkInMinute = rng.Next(0, 60);
                var checkIn = date.AddHours(checkInHour).AddMinutes(checkInMinute);

                double workHours = 8 + rng.NextDouble() * 1.5;
                var checkOut = checkIn.AddHours(workHours);

                var workModes = new[] { "WFO", "WFH", "Hybrid" };
                var workMode = workModes[rng.Next(workModes.Length)];

                attendanceRecords.Add(new Attendance
                {
                    EmpId = emp.EmployeeId,
                    CheckIn = checkIn,
                    CheckOut = checkOut,
                    TotalHours = Math.Round((checkOut - checkIn).TotalHours, 2),
                    WorkMode = workMode,
                    AttendanceDate = date,
                });
            }
        }

        if (attendanceRecords.Count > 0)
        {
            var existingAttendanceCount = await db.Attendances.CountAsync();
            if (existingAttendanceCount < 10)
            {
                db.Attendances.AddRange(attendanceRecords);
            }
        }

        var leaveTypePool = new[] { "Sick", "Casual", "Earned" };
        var leaveStatusPool = new[] { "Approved", "Pending", "Rejected" };
        var leaveReasons = new Dictionary<string, string[]>
        {
            ["Sick"] = new[] { "Not feeling well", "Doctor's appointment", "Fever and cold", "Medical checkup", "Family medical emergency", "Migraine" },
            ["Casual"] = new[] { "Personal work", "Family function", "Travel planned", "Personal errands", "Home maintenance" },
            ["Earned"] = new[] { "Annual vacation", "Family trip", "Extended break", "Holiday travel", "Personal leave" },
        };

        var leaves = new List<Leave>();
        for (int l = 0; l < 50; l++)
        {
            var emp = createdEmployees[rng.Next(createdEmployees.Count)];
            var leaveType = leaveTypePool[rng.Next(leaveTypePool.Length)];
            var days = leaveType == "Earned" ? rng.Next(3, 6) : rng.Next(1, 3);
            var startOffset = rng.Next(10, 180);
            var fromDate = today.AddDays(-startOffset);
            var toDate = fromDate.AddDays(days - 1);

            var status = leaveStatusPool[rng.Next(leaveStatusPool.Length)];
            var appliedOn = fromDate.AddDays(-rng.Next(1, 14));

            var reasons = leaveReasons[leaveType];
            var reason = reasons[rng.Next(reasons.Length)];

            leaves.Add(new Leave
            {
                EmpId = emp.EmployeeId,
                LeaveType = leaveType,
                Reason = reason,
                FromDate = fromDate,
                ToDate = toDate,
                Status = status,
                AppliedOn = appliedOn,
                ApprovedBy = status != "Pending" ? adminUserId : null,
                ApprovedOn = status != "Pending" ? appliedOn.AddDays(rng.Next(1, 5)) : null,
            });
        }

        if (leaves.Count > 0)
        {
            var existingLeaveCount = await db.Leaves.CountAsync();
            if (existingLeaveCount < 5)
            {
                db.Leaves.AddRange(leaves);
            }
        }

        var allocations = new List<EmployeeProjectAllocation>();
        var projectAssignment = new[]
        {
            // Project Alpha (7 employees)
            new { Emp = 0, Proj = 0 }, new { Emp = 4, Proj = 0 }, new { Emp = 7, Proj = 0 },
            new { Emp = 13, Proj = 0 }, new { Emp = 17, Proj = 0 }, new { Emp = 22, Proj = 0 },
            new { Emp = 27, Proj = 0 },
            // Project Beta (6 employees)
            new { Emp = 1, Proj = 1 }, new { Emp = 5, Proj = 1 }, new { Emp = 8, Proj = 1 },
            new { Emp = 14, Proj = 1 }, new { Emp = 18, Proj = 1 }, new { Emp = 23, Proj = 1 },
            // Project Gamma (8 employees)
            new { Emp = 2, Proj = 2 }, new { Emp = 6, Proj = 2 }, new { Emp = 9, Proj = 2 },
            new { Emp = 11, Proj = 2 }, new { Emp = 15, Proj = 2 }, new { Emp = 19, Proj = 2 },
            new { Emp = 24, Proj = 2 }, new { Emp = 28, Proj = 2 },
            // Project Delta (5 employees)
            new { Emp = 3, Proj = 3 }, new { Emp = 10, Proj = 3 }, new { Emp = 16, Proj = 3 },
            new { Emp = 20, Proj = 3 }, new { Emp = 25, Proj = 3 },
            // Project Omega (6 employees)
            new { Emp = 12, Proj = 4 }, new { Emp = 21, Proj = 4 }, new { Emp = 26, Proj = 4 },
            new { Emp = 29, Proj = 4 }, new { Emp = 0, Proj = 4 }, new { Emp = 5, Proj = 4 },
        };

        foreach (var pa in projectAssignment)
        {
            if (pa.Emp < createdEmployees.Count && pa.Proj < dbProjects.Count)
            {
                var empId = createdEmployees[pa.Emp].EmployeeId;
                var projectId = dbProjects[pa.Proj].ProjectId;

                var existingAlloc = await db.EmployeeProjectAllocations
                    .FirstOrDefaultAsync(a => a.EmpId == empId && a.ProjectId == projectId);
                if (existingAlloc == null)
                {
                    var assignedOn = today.AddMonths(-rng.Next(1, 8));
                    allocations.Add(new EmployeeProjectAllocation
                    {
                        EmpId = empId,
                        ProjectId = projectId,
                        AssignedOn = assignedOn,
                        CreateDate = assignedOn,
                        CreatedBy = "System",
                        Status = rng.NextDouble() > 0.15,
                    });
                }
            }
        }

        if (allocations.Count > 0)
        {
            db.EmployeeProjectAllocations.AddRange(allocations);
        }

        var announcementInfos = new[]
        {
            ("Holiday Notice", "The office will remain closed on January 26th in observance of Republic Day. Please plan your work accordingly."),
            ("Annual Meeting", "The Annual General Meeting is scheduled for March 15th at 10:00 AM in the main conference hall. All employees are required to attend."),
            ("Policy Update", "The company has revised its work-from-home policy. Effective next month, employees may work from home up to 2 days per week with manager approval."),
            ("Project Launch", "We are excited to announce the launch of Project Omega with Amazon. This marks a significant milestone for our organization."),
            ("Office Maintenance", "The office will undergo scheduled maintenance on Saturday, February 10th. Please secure your workstations before leaving on Friday."),
            ("New Hire Welcome", "Please join us in welcoming our newest team members who will be joining across various departments this quarter."),
            ("IT Security Update", "Mandatory password reset is required for all users by end of this month. Please update your passwords to comply with new security standards."),
            ("Team Outing", "The annual team outing has been scheduled for April 20th. Details about the venue and activities will be shared soon."),
            ("Performance Review", "Quarterly performance review meetings will commence from March 1st. Managers are requested to schedule reviews with their team members."),
            ("Health & Wellness", "A health and wellness workshop will be conducted on February 28th. Topics include stress management and work-life balance strategies."),
        };

        var announcements = new List<Announcement>();
        for (int i = 0; i < announcementInfos.Length; i++)
        {
            var (title, message) = announcementInfos[i];
            var existingAnnouncement = await db.Announcements
                .FirstOrDefaultAsync(a => a.Title == title && a.CreatedBy == adminUserId);
            if (existingAnnouncement == null)
            {
                announcements.Add(new Announcement
                {
                    Title = title,
                    Message = message,
                    CreatedBy = adminUserId,
                    CreatedOn = today.AddDays(-180 + i * 20),
                    IsActive = i < 8,
                });
            }
        }

        if (announcements.Count > 0)
        {
            db.Announcements.AddRange(announcements);
        }

        var auditLogs = new List<AuditLog>();
        var auditActions = new[] { "Insert", "Update", "Delete" };
        var auditEntities = new[] { "Employee", "Leave", "Attendance", "Project", "Client", "Announcement" };

        for (int i = 0; i < 30; i++)
        {
            auditLogs.Add(new AuditLog
            {
                EntityName = auditEntities[rng.Next(auditEntities.Length)],
                RecordId = rng.Next(1, 50),
                Action = auditActions[rng.Next(auditActions.Length)],
                CreatedBy = i < 5 ? adminUserId : createdEmployees[rng.Next(createdEmployees.Count)].EmployeeId,
                CreatedOn = today.AddDays(-rng.Next(1, 180)),
            });
        }

        if (auditLogs.Count > 0)
        {
            var existingAuditCount = await db.AuditLogs.CountAsync();
            if (existingAuditCount < 5)
            {
                db.AuditLogs.AddRange(auditLogs);
            }
        }

        await db.SaveChangesAsync();
    }
}
