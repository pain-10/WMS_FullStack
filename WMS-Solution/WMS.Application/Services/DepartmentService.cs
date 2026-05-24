using WMS.Application.DTOs.Department;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IGenericRepository<Department> _departmentRepository;

    public DepartmentService(IGenericRepository<Department> departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<List<DepartmentDto>> GetAllAsync()
    {
        var departments = await _departmentRepository.GetAllAsync();
        return departments.Select(MapToDto).ToList();
    }

    public async Task<DepartmentDto?> GetByIdAsync(int id)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        return department == null ? null : MapToDto(department);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
    {
        var department = new Department
        {
            DepartmentName = dto.DepartmentName,
            Description = dto.Description,
            CreatedOn = DateTime.UtcNow
        };

        await _departmentRepository.AddAsync(department);
        await _departmentRepository.SaveChangesAsync();

        return MapToDto(department);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, CreateDepartmentDto dto)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        if (department == null)
        {
            throw new KeyNotFoundException("Department not found");
        }

        department.DepartmentName = dto.DepartmentName;
        department.Description = dto.Description;

        _departmentRepository.Update(department);
        await _departmentRepository.SaveChangesAsync();

        return MapToDto(department);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        if (department == null)
        {
            return false;
        }

        _departmentRepository.Delete(department);
        await _departmentRepository.SaveChangesAsync();
        return true;
    }

    private static DepartmentDto MapToDto(Department department)
    {
        return new DepartmentDto
        {
            DepartmentId = department.DepartmentId,
            DepartmentName = department.DepartmentName,
            Description = department.Description,
            CreatedOn = department.CreatedOn
        };
    }
}