using System.ComponentModel.DataAnnotations;
using WMS.Application.DTOs.Project;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IGenericRepository<Project> _projectRepository;
    private readonly IGenericRepository<EmployeeProjectAllocation> _allocationRepository;
    private readonly IGenericRepository<Client> _clientRepository;

    public ProjectService(
        IGenericRepository<Project> projectRepository,
        IGenericRepository<EmployeeProjectAllocation> allocationRepository,
        IGenericRepository<Client> clientRepository)
    {
        _projectRepository = projectRepository;
        _allocationRepository = allocationRepository;
        _clientRepository = clientRepository;
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectDto dto)
    {
        if (dto.EndDate != default && dto.EndDate < dto.StartDate)
        {
            throw new ValidationException("End date cannot be before start date");
        }

        var existing = await _projectRepository.GetAllAsync();
        if (existing.Any(p => p.ProjectName.Equals(dto.ProjectName, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ValidationException("A project with this name already exists");
        }

        var project = new Project
        {
            ProjectName = dto.ProjectName,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            ClientId = dto.ClientId,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status
        };

        await _projectRepository.AddAsync(project);
        await _projectRepository.SaveChangesAsync();

        return await MapToDtoAsync(project);
    }

    public async Task<ProjectDto> UpdateAsync(int id, CreateProjectDto dto)
    {
        if (dto.EndDate != default && dto.EndDate < dto.StartDate)
        {
            throw new ValidationException("End date cannot be before start date");
        }

        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
        {
            throw new KeyNotFoundException("Project not found");
        }

        var existing = await _projectRepository.GetAllAsync();
        if (existing.Any(p => p.ProjectName.Equals(dto.ProjectName, StringComparison.OrdinalIgnoreCase) && p.ProjectId != id))
        {
            throw new ValidationException("A project with this name already exists");
        }

        project.ProjectName = dto.ProjectName;
        project.Description = dto.Description;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.ClientId = dto.ClientId;
        project.Status = string.IsNullOrWhiteSpace(dto.Status) ? project.Status : dto.Status;

        _projectRepository.Update(project);
        await _projectRepository.SaveChangesAsync();

        return await MapToDtoAsync(project);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
        {
            return false;
        }

        _projectRepository.Delete(project);
        await _projectRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProjectDto>> GetAllAsync()
    {
        var projects = await _projectRepository.GetAllAsync();
        var result = new List<ProjectDto>();

        foreach (var project in projects)
        {
            result.Add(await MapToDtoAsync(project));
        }

        return result;
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
        {
            return null;
        }

        return await MapToDtoAsync(project);
    }

    public async Task AllocateEmployeeAsync(AllocateEmployeeDto dto)
    {
        var existing = await _allocationRepository.GetAllAsync();
        if (existing.Any(a => a.EmpId == dto.EmployeeId && a.ProjectId == dto.ProjectId && a.Status))
        {
            throw new ValidationException("Employee is already allocated to this project");
        }

        var allocation = new EmployeeProjectAllocation
        {
            EmpId = dto.EmployeeId,
            ProjectId = dto.ProjectId,
            AssignedOn = DateTime.UtcNow,
            CreateDate = DateTime.UtcNow,
            CreatedBy = "system",
            Status = true
        };

        await _allocationRepository.AddAsync(allocation);
        await _allocationRepository.SaveChangesAsync();
    }

    public async Task<List<ProjectDto>> GetProjectsByEmployeeAsync(int employeeId)
    {
        var allocations = await _allocationRepository.GetAllAsync();
        var projectIds = allocations.Where(a => a.EmpId == employeeId).Select(a => a.ProjectId).ToList();
        var projects = await _projectRepository.GetAllAsync();
        var result = new List<ProjectDto>();

        foreach (var project in projects.Where(p => projectIds.Contains(p.ProjectId)))
        {
            result.Add(await MapToDtoAsync(project));
        }

        return result;
    }

    private async Task<ProjectDto> MapToDtoAsync(Project project)
    {
        var clientName = project.ClientId == null
            ? null
            : (await _clientRepository.GetByIdAsync(project.ClientId.Value))?.ClientName;

        return new ProjectDto
        {
            ProjectId = project.ProjectId,
            ProjectName = project.ProjectName,
            Description = project.Description,
            StartDate = project.StartDate.GetValueOrDefault(),
            EndDate = project.EndDate.GetValueOrDefault(),
            ClientId = project.ClientId.GetValueOrDefault(),
            Status = project.Status,
            ClientName = clientName
        };
    }
}