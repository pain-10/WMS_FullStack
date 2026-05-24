using System.ComponentModel.DataAnnotations;
using System.Linq;
using WMS.Application.DTOs.Allocation;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class AllocationService : IAllocationService
{
    private readonly IGenericRepository<EmployeeProjectAllocation> _allocationRepository;
    private readonly IGenericRepository<Employee> _employeeRepository;
    private readonly IGenericRepository<Project> _projectRepository;

    public AllocationService(
        IGenericRepository<EmployeeProjectAllocation> allocationRepository,
        IGenericRepository<Employee> employeeRepository,
        IGenericRepository<Project> projectRepository)
    {
        _allocationRepository = allocationRepository;
        _employeeRepository = employeeRepository;
        _projectRepository = projectRepository;
    }

    public async Task<AllocationDto> CreateAsync(CreateAllocationDto dto)
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

        return await MapToDtoAsync(allocation);
    }

    public async Task<List<AllocationDto>> GetAllAsync()
    {
        var allocations = await _allocationRepository.GetAllAsync();
        var result = new List<AllocationDto>();

        foreach (var allocation in allocations)
        {
            result.Add(await MapToDtoAsync(allocation));
        }

        return result;
    }

    public async Task<List<AllocationDto>> GetByEmployeeAsync(int employeeId)
    {
        var allocations = await _allocationRepository.GetAllAsync();
        var result = new List<AllocationDto>();

        foreach (var allocation in allocations.Where(a => a.EmpId == employeeId))
        {
            result.Add(await MapToDtoAsync(allocation));
        }

        return result;
    }

    public async Task<List<AllocationDto>> GetByProjectAsync(int projectId)
    {
        var allocations = await _allocationRepository.GetAllAsync();
        var result = new List<AllocationDto>();

        foreach (var allocation in allocations.Where(a => a.ProjectId == projectId))
        {
            result.Add(await MapToDtoAsync(allocation));
        }

        return result;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var allocation = await _allocationRepository.GetByIdAsync(id);
        if (allocation == null)
        {
            return false;
        }

        _allocationRepository.Delete(allocation);
        await _allocationRepository.SaveChangesAsync();
        return true;
    }

    private async Task<AllocationDto> MapToDtoAsync(EmployeeProjectAllocation allocation)
    {
        var employee = await _employeeRepository.GetByIdAsync(allocation.EmpId);
        var project = await _projectRepository.GetByIdAsync(allocation.ProjectId);

        return new AllocationDto
        {
            AllocationId = allocation.AllocationId,
            EmployeeId = allocation.EmpId,
            EmployeeName = employee == null ? null : $"{employee.FirstName} {employee.LastName}",
            ProjectId = allocation.ProjectId,
            ProjectName = project?.ProjectName,
            AssignedOn = allocation.AssignedOn,
            CreateDate = allocation.CreateDate,
            CreatedBy = allocation.CreatedBy,
            Status = allocation.Status,
            UpdatedBy = allocation.UpdatedBy,
            UpdatedDate = allocation.UpdatedDate
        };
    }
}
