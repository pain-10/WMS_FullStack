using System.ComponentModel.DataAnnotations;
using Moq;
using FluentAssertions;
using WMS.Application.DTOs.Attendance;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Tests.AttendanceModule;

public class AttendanceServiceTests
{
    private readonly Mock<IGenericRepository<Attendance>> _attendanceRepoMock;
    private readonly Mock<IGenericRepository<Employee>> _employeeRepoMock;
    private readonly AttendanceService _sut;
    private static readonly TimeZoneInfo IstZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
    private static DateTime IstNow => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, IstZone);

    public AttendanceServiceTests()
    {
        _attendanceRepoMock = new Mock<IGenericRepository<Attendance>>();
        _employeeRepoMock = new Mock<IGenericRepository<Employee>>();

        _sut = new AttendanceService(
            _attendanceRepoMock.Object,
            _employeeRepoMock.Object);
    }

    [Fact]
    public async Task CheckIn_FirstTime_Success()
    {
        var employee = new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", PhoneNumber = "1234567890", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow };

        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(employee);
        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Attendance>());
        _attendanceRepoMock.Setup(x => x.AddAsync(It.IsAny<Attendance>())).Returns(Task.CompletedTask);
        _attendanceRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(employee);

        var dto = new CheckInDto { EmployeeId = 1, WorkMode = "WFO" };

        var result = await _sut.CheckInAsync(dto);

        result.Should().NotBeNull();
        result.WorkMode.Should().Be("WFO");
        result.EmployeeId.Should().Be(1);
        _attendanceRepoMock.Verify(x => x.AddAsync(It.IsAny<Attendance>()), Times.Once);
    }

    [Fact]
    public async Task CheckIn_SameDayTwice_Fail()
    {
        var employee = new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", PhoneNumber = "1234567890", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow };

        var existingAttendance = new Attendance
        {
            AttendanceId = 1,
            EmpId = 1,
            CheckIn = IstNow.AddHours(-2),
            AttendanceDate = IstNow.Date,
            WorkMode = "WFO"
        };

        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(employee);
        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Attendance> { existingAttendance });

        var dto = new CheckInDto { EmployeeId = 1, WorkMode = "WFH" };

        await FluentActions.Awaiting(() => _sut.CheckInAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("Employee already has an active check-in today");
    }

    [Fact]
    public async Task CheckOut_AfterCheckIn_Success()
    {
        var checkInTime = IstNow.AddHours(-8);
        var attendance = new Attendance
        {
            AttendanceId = 1,
            EmpId = 1,
            CheckIn = checkInTime,
            AttendanceDate = IstNow.Date,
            WorkMode = "WFO"
        };

        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Attendance> { attendance });
        _attendanceRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe" });

        var dto = new CheckOutDto { EmployeeId = 1 };

        var result = await _sut.CheckOutAsync(dto);

        result.Should().NotBeNull();
        result.CheckOutTime.Should().NotBeNull();
        result.WorkingHours.Should().BeGreaterThan(0);
        _attendanceRepoMock.Verify(x => x.Update(It.IsAny<Attendance>()), Times.Once);
    }

    [Fact]
    public async Task CheckOut_WithoutCheckIn_Fail()
    {
        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Attendance>());

        var dto = new CheckOutDto { EmployeeId = 1 };

        await FluentActions.Awaiting(() => _sut.CheckOutAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("No active check-in found");
    }

    [Fact]
    public async Task TotalHours_CalculatedCorrectly()
    {
        var checkInTime = IstNow.AddHours(-8).AddMinutes(-30);
        var attendance = new Attendance
        {
            AttendanceId = 1,
            EmpId = 1,
            CheckIn = checkInTime,
            CheckOut = null,
            AttendanceDate = IstNow.Date,
            WorkMode = "WFO"
        };

        _attendanceRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Attendance> { attendance });
        _attendanceRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe" });

        var dto = new CheckOutDto { EmployeeId = 1 };

        var result = await _sut.CheckOutAsync(dto);

        result.Should().NotBeNull();
        Math.Round(result.WorkingHours, 1).Should().Be(8.5);
    }
}
