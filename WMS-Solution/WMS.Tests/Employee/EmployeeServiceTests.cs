using Moq;
using FluentAssertions;
using WMS.Application.DTOs.Employee;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Tests.EmployeeModule;

public class EmployeeServiceTests
{
    private readonly Mock<IGenericRepository<Employee>> _employeeRepoMock;
    private readonly Mock<IGenericRepository<Department>> _departmentRepoMock;
    private readonly Mock<IGenericRepository<Role>> _roleRepoMock;
    private readonly EmployeeService _sut;

    public EmployeeServiceTests()
    {
        _employeeRepoMock = new Mock<IGenericRepository<Employee>>();
        _departmentRepoMock = new Mock<IGenericRepository<Department>>();
        _roleRepoMock = new Mock<IGenericRepository<Role>>();

        _sut = new EmployeeService(
            _employeeRepoMock.Object,
            _departmentRepoMock.Object,
            _roleRepoMock.Object);
    }

    [Fact]
    public async Task GetEmployees_ReturnEmployeeList()
    {
        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", PhoneNumber = "1234567890", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 2, FirstName = "Jane", LastName = "Smith", Email = "jane@test.com", PhoneNumber = "9876543210", Gender = 'F', DOB = new DateTime(1992, 3, 15), DOJ = new DateTime(2024, 2, 1), DepartmentId = 2, RoleId = 2, Status = "Active", CreatedOn = DateTime.UtcNow }
        };
        _employeeRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(employees);
        _departmentRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Department { DepartmentId = 1, DepartmentName = "IT" });
        _departmentRepoMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(new Department { DepartmentId = 2, DepartmentName = "HR" });
        _roleRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Role { RoleId = 1, RoleName = "Admin" });
        _roleRepoMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(new Role { RoleId = 2, RoleName = "Employee" });

        var result = await _sut.GetAllAsync();

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].FirstName.Should().Be("John");
        result[1].FirstName.Should().Be("Jane");
    }

    [Fact]
    public async Task AddEmployee_Success()
    {
        _employeeRepoMock.Setup(x => x.AddAsync(It.IsAny<Employee>())).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _departmentRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Department { DepartmentId = 1, DepartmentName = "IT" });
        _roleRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Role { RoleId = 1, RoleName = "Developer" });

        var dto = new CreateEmployeeDto
        {
            FirstName = "Alice",
            LastName = "Johnson",
            Email = "alice@test.com",
            PhoneNumber = "5555555555",
            Gender = "F",
            DOB = new DateTime(1995, 6, 10),
            DOJ = new DateTime(2024, 3, 1),
            DepartmentId = 1,
            RoleId = 1,
            Status = "Active"
        };

        var result = await _sut.CreateAsync(dto);

        result.Should().NotBeNull();
        result.FirstName.Should().Be("Alice");
        result.Email.Should().Be("alice@test.com");
        _employeeRepoMock.Verify(x => x.AddAsync(It.IsAny<Employee>()), Times.Once);
        _employeeRepoMock.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateEmployee_Success()
    {
        var existing = new Employee
        {
            EmployeeId = 1,
            FirstName = "Old",
            LastName = "Name",
            Email = "old@test.com",
            PhoneNumber = "1111111111",
            Gender = 'M',
            DOB = new DateTime(1990, 1, 1),
            DOJ = new DateTime(2024, 1, 1),
            DepartmentId = 1,
            RoleId = 1,
            Status = "Active",
            CreatedOn = DateTime.UtcNow
        };

        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existing);
        _employeeRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _departmentRepoMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(new Department { DepartmentId = 2, DepartmentName = "HR" });
        _roleRepoMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(new Role { RoleId = 2, RoleName = "Manager" });

        var dto = new UpdateEmployeeDto
        {
            FirstName = "New",
            LastName = "Name",
            Email = "new@test.com",
            PhoneNumber = "2222222222",
            Gender = "M",
            DOB = new DateTime(1990, 1, 1),
            DOJ = new DateTime(2024, 1, 1),
            DepartmentId = 2,
            RoleId = 2,
            Status = "Active"
        };

        var result = await _sut.UpdateAsync(1, dto);

        result.Should().NotBeNull();
        result.FirstName.Should().Be("New");
        result.Email.Should().Be("new@test.com");
        result.DepartmentId.Should().Be(2);
        _employeeRepoMock.Verify(x => x.Update(It.IsAny<Employee>()), Times.Once);
    }

    [Fact]
    public async Task DeleteEmployee_Success()
    {
        var employee = new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", PhoneNumber = "1234567890", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow };

        _employeeRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(employee);
        _employeeRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var result = await _sut.DeleteAsync(1);

        result.Should().BeTrue();
        _employeeRepoMock.Verify(x => x.Delete(employee), Times.Once);
    }

    [Fact]
    public async Task DeleteEmployee_NotFound_ReturnFalse()
    {
        _employeeRepoMock.Setup(x => x.GetByIdAsync(99)).ReturnsAsync((Employee?)null);

        var result = await _sut.DeleteAsync(99);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task SearchEmployee_ReturnResults()
    {
        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", PhoneNumber = "1234567890", Gender = 'M', DOB = new DateTime(1990, 1, 1), DOJ = new DateTime(2024, 1, 1), DepartmentId = 1, RoleId = 1, Status = "Active", CreatedOn = DateTime.UtcNow },
            new() { EmployeeId = 2, FirstName = "Jane", LastName = "Smith", Email = "jane@test.com", PhoneNumber = "9876543210", Gender = 'F', DOB = new DateTime(1992, 3, 15), DOJ = new DateTime(2024, 2, 1), DepartmentId = 2, RoleId = 2, Status = "Active", CreatedOn = DateTime.UtcNow }
        };
        _employeeRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(employees);
        _departmentRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Department { DepartmentId = 1, DepartmentName = "IT" });
        _departmentRepoMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(new Department { DepartmentId = 2, DepartmentName = "HR" });
        _roleRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Role { RoleId = 1, RoleName = "Admin" });
        _roleRepoMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(new Role { RoleId = 2, RoleName = "Employee" });

        var all = await _sut.GetAllAsync();
        var filtered = all.Where(e => e.FirstName.Contains("John") || e.LastName.Contains("John")).ToList();

        filtered.Should().NotBeNull();
        filtered.Should().HaveCount(1);
        filtered[0].FirstName.Should().Be("John");
    }
}
