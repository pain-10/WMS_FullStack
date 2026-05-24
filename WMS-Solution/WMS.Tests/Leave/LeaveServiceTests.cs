using System.ComponentModel.DataAnnotations;
using Moq;
using FluentAssertions;
using WMS.Application.DTOs.Leave;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Tests.LeaveModule;

public class LeaveServiceTests
{
    private readonly Mock<IGenericRepository<Leave>> _leaveRepoMock;
    private readonly Mock<IGenericRepository<Employee>> _employeeRepoMock;
    private readonly LeaveService _sut;

    public LeaveServiceTests()
    {
        _leaveRepoMock = new Mock<IGenericRepository<Leave>>();
        _employeeRepoMock = new Mock<IGenericRepository<Employee>>();

        _sut = new LeaveService(
            _leaveRepoMock.Object,
            _employeeRepoMock.Object);
    }

    [Fact]
    public async Task ApplyLeave_ValidDates_Success()
    {
        var employee = new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", PhoneNumber = "1234567890", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow };

        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(employee);
        _leaveRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Leave>());
        _leaveRepoMock.Setup(x => x.AddAsync(It.IsAny<Leave>())).Returns(Task.CompletedTask);
        _leaveRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(employee);

        var dto = new CreateLeaveDto
        {
            EmployeeId = 1,
            LeaveType = "Sick",
            StartDate = DateTime.UtcNow.Date.AddDays(1),
            EndDate = DateTime.UtcNow.Date.AddDays(2),
            Reason = "Feeling unwell"
        };

        var result = await _sut.CreateAsync(dto);

        result.Should().NotBeNull();
        result.LeaveType.Should().Be("Sick");
        result.Status.Should().Be("Pending");
        _leaveRepoMock.Verify(x => x.AddAsync(It.IsAny<Leave>()), Times.Once);
    }

    [Fact]
    public async Task ApplyLeave_InvalidDates_Fail()
    {
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Employee { EmployeeId = 1 });

        var dto = new CreateLeaveDto
        {
            EmployeeId = 1,
            LeaveType = "Casual",
            StartDate = DateTime.UtcNow.Date.AddDays(-1),
            EndDate = DateTime.UtcNow.Date
        };

        await FluentActions.Awaiting(() => _sut.CreateAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("Leave start date cannot be in the past");
    }

    [Fact]
    public async Task ApplyLeave_EndDateBeforeStartDate_Fail()
    {
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Employee { EmployeeId = 1 });

        var dto = new CreateLeaveDto
        {
            EmployeeId = 1,
            LeaveType = "Earned",
            StartDate = DateTime.UtcNow.Date.AddDays(3),
            EndDate = DateTime.UtcNow.Date.AddDays(1)
        };

        await FluentActions.Awaiting(() => _sut.CreateAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("Leave start date cannot be after end date");
    }

    [Fact]
    public async Task ApproveLeave_Success()
    {
        var leave = new Leave
        {
            LeaveId = 1,
            EmpId = 1,
            LeaveType = "Sick",
            FromDate = DateTime.UtcNow.Date.AddDays(1),
            ToDate = DateTime.UtcNow.Date.AddDays(2),
            Status = "Pending",
            AppliedOn = DateTime.UtcNow
        };

        _leaveRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(leave);
        _leaveRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe" });

        var dto = new UpdateLeaveStatusDto { Status = "Approved" };

        var result = await _sut.UpdateStatusAsync(1, dto, 2);

        result.Should().NotBeNull();
        result.Status.Should().Be("Approved");
        result.ApprovedBy.Should().Be(2);
    }

    [Fact]
    public async Task RejectLeave_Success()
    {
        var leave = new Leave
        {
            LeaveId = 1,
            EmpId = 1,
            LeaveType = "Sick",
            FromDate = DateTime.UtcNow.Date.AddDays(1),
            ToDate = DateTime.UtcNow.Date.AddDays(2),
            Status = "Pending",
            AppliedOn = DateTime.UtcNow
        };

        _leaveRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(leave);
        _leaveRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe" });

        var dto = new UpdateLeaveStatusDto { Status = "Rejected" };

        var result = await _sut.UpdateStatusAsync(1, dto, 2);

        result.Should().NotBeNull();
        result.Status.Should().Be("Rejected");
    }

    [Fact]
    public async Task CancelLeave_Success()
    {
        var leave = new Leave
        {
            LeaveId = 1,
            EmpId = 1,
            LeaveType = "Sick",
            FromDate = DateTime.UtcNow.Date.AddDays(1),
            ToDate = DateTime.UtcNow.Date.AddDays(2),
            Status = "Pending",
            AppliedOn = DateTime.UtcNow
        };

        _leaveRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(leave);
        _leaveRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var result = await _sut.CancelAsync(1);

        result.Should().BeTrue();
        leave.Status.Should().Be("Cancelled");
        _leaveRepoMock.Verify(x => x.Update(leave), Times.Once);
    }

    [Fact]
    public async Task CancelLeave_NonPending_Fail()
    {
        var leave = new Leave
        {
            LeaveId = 1,
            EmpId = 1,
            Status = "Approved",
            AppliedOn = DateTime.UtcNow
        };

        _leaveRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(leave);

        var result = await _sut.CancelAsync(1);

        result.Should().BeFalse();
        _leaveRepoMock.Verify(x => x.Update(It.IsAny<Leave>()), Times.Never);
    }

    [Fact]
    public async Task CancelLeave_WrongEmployee_Fail()
    {
        var leave = new Leave
        {
            LeaveId = 1,
            EmpId = 2,
            Status = "Pending",
            AppliedOn = DateTime.UtcNow
        };

        _leaveRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(leave);

        var result = await _sut.CancelAsync(1, 1);

        result.Should().BeFalse();
        _leaveRepoMock.Verify(x => x.Update(It.IsAny<Leave>()), Times.Never);
    }
}
