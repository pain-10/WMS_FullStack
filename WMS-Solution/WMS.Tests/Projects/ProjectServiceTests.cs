using System.ComponentModel.DataAnnotations;
using Moq;
using FluentAssertions;
using WMS.Application.DTOs.Project;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Tests.Projects;

public class ProjectServiceTests
{
    private readonly Mock<IGenericRepository<Project>> _projectRepoMock;
    private readonly Mock<IGenericRepository<EmployeeProjectAllocation>> _allocationRepoMock;
    private readonly Mock<IGenericRepository<Client>> _clientRepoMock;
    private readonly ProjectService _sut;

    public ProjectServiceTests()
    {
        _projectRepoMock = new Mock<IGenericRepository<Project>>();
        _allocationRepoMock = new Mock<IGenericRepository<EmployeeProjectAllocation>>();
        _clientRepoMock = new Mock<IGenericRepository<Client>>();

        _sut = new ProjectService(
            _projectRepoMock.Object,
            _allocationRepoMock.Object,
            _clientRepoMock.Object);
    }

    [Fact]
    public async Task AddProject_Success()
    {
        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Project>());
        _projectRepoMock.Setup(x => x.AddAsync(It.IsAny<Project>())).Returns(Task.CompletedTask);
        _projectRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var dto = new CreateProjectDto
        {
            ProjectName = "New Project",
            Description = "Test description",
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddMonths(6),
            ClientId = 1,
            Status = "Active"
        };

        var result = await _sut.CreateAsync(dto);

        result.Should().NotBeNull();
        result.ProjectName.Should().Be("New Project");
        result.Status.Should().Be("Active");
        _projectRepoMock.Verify(x => x.AddAsync(It.IsAny<Project>()), Times.Once);
    }

    [Fact]
    public async Task AddProject_DuplicateName_Fail()
    {
        var existing = new List<Project>
        {
            new() { ProjectId = 1, ProjectName = "Existing Project" }
        };

        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(existing);

        var dto = new CreateProjectDto
        {
            ProjectName = "Existing Project",
            Description = "Should fail",
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddMonths(3),
            Status = "Active"
        };

        await FluentActions.Awaiting(() => _sut.CreateAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("A project with this name already exists");
    }

    [Fact]
    public async Task AddProject_EndDateBeforeStartDate_Fail()
    {
        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Project>());

        var dto = new CreateProjectDto
        {
            ProjectName = "Test Project",
            StartDate = DateTime.UtcNow.Date.AddMonths(3),
            EndDate = DateTime.UtcNow.Date,
            Status = "Active"
        };

        await FluentActions.Awaiting(() => _sut.CreateAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("End date cannot be before start date");
    }

    [Fact]
    public async Task AssignEmployee_Project_Success()
    {
        _allocationRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<EmployeeProjectAllocation>());
        _allocationRepoMock.Setup(x => x.AddAsync(It.IsAny<EmployeeProjectAllocation>())).Returns(Task.CompletedTask);
        _allocationRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var dto = new AllocateEmployeeDto { EmployeeId = 1, ProjectId = 1 };

        await FluentActions.Awaiting(() => _sut.AllocateEmployeeAsync(dto))
            .Should().NotThrowAsync();

        _allocationRepoMock.Verify(x => x.AddAsync(It.IsAny<EmployeeProjectAllocation>()), Times.Once);
    }

    [Fact]
    public async Task AssignEmployee_Duplicate_Fail()
    {
        var existing = new List<EmployeeProjectAllocation>
        {
            new() { AllocationId = 1, EmpId = 1, ProjectId = 1, Status = true }
        };

        _allocationRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(existing);

        var dto = new AllocateEmployeeDto { EmployeeId = 1, ProjectId = 1 };

        await FluentActions.Awaiting(() => _sut.AllocateEmployeeAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("Employee is already allocated to this project");
    }

    [Fact]
    public async Task DeleteProject_Success()
    {
        var project = new Project { ProjectId = 1, ProjectName = "Test Project" };

        _projectRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(project);
        _projectRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var result = await _sut.DeleteAsync(1);

        result.Should().BeTrue();
        _projectRepoMock.Verify(x => x.Delete(project), Times.Once);
    }

    [Fact]
    public async Task DeleteProject_NotFound_ReturnFalse()
    {
        _projectRepoMock.Setup(x => x.GetByIdAsync(99)).ReturnsAsync((Project?)null);

        var result = await _sut.DeleteAsync(99);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetAllProjects_ReturnsList()
    {
        var projects = new List<Project>
        {
            new() { ProjectId = 1, ProjectName = "Project A", ClientId = null, StartDate = DateTime.UtcNow.Date, EndDate = DateTime.UtcNow.Date.AddMonths(3), Status = "Active" },
            new() { ProjectId = 2, ProjectName = "Project B", ClientId = 1, StartDate = DateTime.UtcNow.Date, EndDate = DateTime.UtcNow.Date.AddMonths(6), Status = "Active" }
        };

        _projectRepoMock.Setup(x => x.GetAllAsync()).ReturnsAsync(projects);
        _clientRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(new Client { ClientId = 1, ClientName = "Test Client" });

        var result = await _sut.GetAllAsync();

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }
}
