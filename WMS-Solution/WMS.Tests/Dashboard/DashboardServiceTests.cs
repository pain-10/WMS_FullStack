using Moq;
using FluentAssertions;
using WMS.Application.DTOs.Dashboard;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Tests.Dashboard;

public class DashboardServiceTests
{
    private readonly Mock<IGenericRepository<Employee>> _employeeRepoMock;
    private readonly Mock<IGenericRepository<Project>> _projectRepoMock;
    private readonly Mock<IGenericRepository<Client>> _clientRepoMock;
    private readonly Mock<IGenericRepository<Announcement>> _announcementRepoMock;
    private readonly Mock<IGenericRepository<Leave>> _leaveRepoMock;
    private readonly Mock<IGenericRepository<Attendance>> _attendanceRepoMock;
    private readonly DashboardService _sut;

    public DashboardServiceTests()
    {
        _employeeRepoMock = new Mock<IGenericRepository<Employee>>();
        _projectRepoMock = new Mock<IGenericRepository<Project>>();
        _clientRepoMock = new Mock<IGenericRepository<Client>>();
        _announcementRepoMock = new Mock<IGenericRepository<Announcement>>();
        _leaveRepoMock = new Mock<IGenericRepository<Leave>>();
        _attendanceRepoMock = new Mock<IGenericRepository<Attendance>>();

        _sut = new DashboardService(
            _employeeRepoMock.Object,
            _projectRepoMock.Object,
            _clientRepoMock.Object,
            _announcementRepoMock.Object,
            _leaveRepoMock.Object,
            _attendanceRepoMock.Object);
    }

    [Fact]
    public async Task GetEmployeeCount_ReturnValue()
    {
        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, FirstName = "Active1", LastName = "User", Email = "a1@test.com", PhoneNumber = "1111111111", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 2, FirstName = "Active2", LastName = "User", Email = "a2@test.com", PhoneNumber = "2222222222", Gender = 'F', DOB = new DateTime(1992, 2, 2), DOJ = new DateTime(2024, 2, 1), DepartmentId = 1, RoleId = 2, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 3, FirstName = "Inactive", LastName = "User", Email = "i1@test.com", PhoneNumber = "3333333333", Gender = 'M', DOB = new DateTime(1985, 3, 3), DOJ = new DateTime(2023, 1, 1), DepartmentId = 2, RoleId = 2, Status = "Inactive", CreatedOn = DateTime.UtcNow }
        };

        _employeeRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(employees);
        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Project>());
        _clientRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Client>());
        _announcementRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Announcement>());
        _leaveRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Leave>());
        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Attendance>());

        var result = await _sut.GetDashboardAsync();

        result.Should().NotBeNull();
        result.TotalEmployees.Should().Be(3);
        result.ActiveEmployees.Should().Be(2);
    }

    [Fact]
    public async Task GetPendingLeaveCount_ReturnValue()
    {
        _employeeRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Employee>());
        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Project>());
        _clientRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Client>());
        _announcementRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Announcement>());

        var leaves = new List<Leave>
        {
            new() { LeaveId = 1, EmpId = 1, Status = "Pending" },
            new() { LeaveId = 2, EmpId = 1, Status = "Approved" },
            new() { LeaveId = 3, EmpId = 2, Status = "Pending" },
            new() { LeaveId = 4, EmpId = 3, Status = "Pending" }
        };
        _leaveRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(leaves);
        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Attendance>());

        var result = await _sut.GetDashboardAsync();

        result.Should().NotBeNull();
        result.PendingLeaves.Should().Be(3);
    }

    [Fact]
    public async Task AttendanceStatistics_ReturnData()
    {
        var today = DateTime.UtcNow.Date;

        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, FirstName = "Emp1", LastName = "A", Email = "e1@test.com", PhoneNumber = "1111111111", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 2, FirstName = "Emp2", LastName = "B", Email = "e2@test.com", PhoneNumber = "2222222222", Gender = 'F', DOB = new DateTime(1992, 2, 2), DOJ = new DateTime(2024, 2, 1), DepartmentId = 1, RoleId = 2, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 3, FirstName = "Emp3", LastName = "C", Email = "e3@test.com", PhoneNumber = "3333333333", Gender = 'M', DOB = new DateTime(1985, 3, 3), DOJ = new DateTime(2023, 1, 1), DepartmentId = 2, RoleId = 2, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 4, FirstName = "Emp4", LastName = "D", Email = "e4@test.com", PhoneNumber = "4444444444", Gender = 'F', DOB = new DateTime(1995, 4, 4), DOJ = new DateTime(2024, 3, 1), DepartmentId = 1, RoleId = 1, Status = "Inactive", CreatedOn = DateTime.UtcNow }
        };

        var attendances = new List<Attendance>
        {
            new() { AttendanceId = 1, EmpId = 1, CheckIn = DateTime.UtcNow.AddHours(-8), AttendanceDate = today, WorkMode = "WFO" },
            new() { AttendanceId = 2, EmpId = 2, CheckIn = DateTime.UtcNow.AddHours(-7), AttendanceDate = today, WorkMode = "WFH" },
            new() { AttendanceId = 3, EmpId = 3, CheckIn = DateTime.UtcNow.AddHours(-6), AttendanceDate = today, WorkMode = "WFO" }
        };

        _employeeRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(employees);
        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Project>());
        _clientRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Client>());
        _announcementRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Announcement>());
        _leaveRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Leave>());
        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(attendances);

        var result = await _sut.GetDashboardAsync();

        result.Should().NotBeNull();
        result.PresentToday.Should().Be(3);
        result.WfoToday.Should().Be(2);
        result.WfhToday.Should().Be(1);
        result.AbsentToday.Should().Be(0);
        result.TodayAttendanceCount.Should().Be(3);
        result.TotalEmployees.Should().Be(4);
        result.ActiveEmployees.Should().Be(3);
    }

    [Fact]
    public async Task GetDashboardAsync_ReturnsAllCounts()
    {
        var today = DateTime.UtcNow.Date;

        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, FirstName = "E1", LastName = "U", Email = "e1@t.com", PhoneNumber = "1111111111", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 2, FirstName = "E2", LastName = "U", Email = "e2@t.com", PhoneNumber = "2222222222", Gender = 'F', DOB = new DateTime(1992, 2, 2), DOJ = new DateTime(2024, 2, 1), DepartmentId = 1, RoleId = 2, Status = "Active", CreatedOn = DateTime.UtcNow }
        };

        var projects = new List<Project>
        {
            new() { ProjectId = 1, ProjectName = "P1", Status = "Active" },
            new() { ProjectId = 2, ProjectName = "P2", Status = "Completed" }
        };

        var clients = new List<Client>
        {
            new() { ClientId = 1, ClientName = "C1" }
        };

        var announcements = new List<Announcement>
        {
            new() { AnnouncementId = 1, Title = "A1", Message = "M1", CreatedBy = 1, CreatedOn = DateTime.UtcNow, IsActive = true }
        };

        var leaves = new List<Leave>
        {
            new() { LeaveId = 1, EmpId = 1, Status = "Pending" }
        };

        var attendances = new List<Attendance>
        {
            new() { AttendanceId = 1, EmpId = 1, CheckIn = DateTime.UtcNow.AddHours(-8), AttendanceDate = today, WorkMode = "WFO" }
        };

        _employeeRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(employees);
        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(projects);
        _clientRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(clients);
        _announcementRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(announcements);
        _leaveRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(leaves);
        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(attendances);

        var result = await _sut.GetDashboardAsync();

        result.Should().NotBeNull();
        result.TotalEmployees.Should().Be(2);
        result.ActiveEmployees.Should().Be(2);
        result.TotalProjects.Should().Be(2);
        result.ActiveProjects.Should().Be(1);
        result.TotalClients.Should().Be(1);
        result.TotalAnnouncements.Should().Be(1);
        result.PendingLeaves.Should().Be(1);
        result.PresentToday.Should().Be(1);
        result.WfoToday.Should().Be(1);
        result.WfhToday.Should().Be(0);
        result.AbsentToday.Should().Be(1);
        result.TodayAttendanceCount.Should().Be(1);
    }
}
