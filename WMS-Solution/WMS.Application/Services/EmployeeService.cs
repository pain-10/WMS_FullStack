using System.Linq;
using WMS.Application.DTOs.Employee;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IGenericRepository<Employee> _employeeRepository;
    private readonly IGenericRepository<Department> _departmentRepository;
    private readonly IGenericRepository<Role> _roleRepository;

    public EmployeeService(
        IGenericRepository<Employee> employeeRepository,
        IGenericRepository<Department> departmentRepository,
        IGenericRepository<Role> roleRepository)
    {
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
        _roleRepository = roleRepository;
    }

    public async Task<List<EmployeeDto>> GetAllAsync()
    {
        var employees = await _employeeRepository.GetAllAsync();
        var result = new List<EmployeeDto>();

        foreach (var employee in employees)
        {
            result.Add(await MapToDtoAsync(employee));
        }

        return result;
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            return null;
        }

        return await MapToDtoAsync(employee);
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Gender = dto.Gender.FirstOrDefault(),
            DOB = dto.DOB,
            DOJ = dto.DOJ,
            DepartmentId = dto.DepartmentId,
            RoleId = dto.RoleId,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status,
            CreatedOn = DateTime.UtcNow
        };

        await _employeeRepository.AddAsync(employee);
        await _employeeRepository.SaveChangesAsync();

        return await MapToDtoAsync(employee);
    }

    public async Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            throw new KeyNotFoundException("Employee not found");
        }

        employee.FirstName = dto.FirstName;
        employee.LastName = dto.LastName;
        employee.Email = dto.Email;
        employee.PhoneNumber = dto.PhoneNumber;
        employee.Gender = dto.Gender.FirstOrDefault();
        employee.DOB = dto.DOB;
        employee.DOJ = dto.DOJ;
        employee.DepartmentId = dto.DepartmentId;
        employee.RoleId = dto.RoleId;
        employee.Status = string.IsNullOrWhiteSpace(dto.Status) ? employee.Status : dto.Status;
        employee.UpdatedOn = DateTime.UtcNow;

        _employeeRepository.Update(employee);
        await _employeeRepository.SaveChangesAsync();

        return await MapToDtoAsync(employee);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            return false;
        }

        _employeeRepository.Delete(employee);
        await _employeeRepository.SaveChangesAsync();
        return true;
    }

    private async Task<EmployeeDto> MapToDtoAsync(Employee employee)
    {
        var department = await _departmentRepository.GetByIdAsync(employee.DepartmentId);
        var role = await _roleRepository.GetByIdAsync(employee.RoleId);

        return new EmployeeDto
        {
            EmployeeId = employee.EmployeeId,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            Gender = employee.Gender.ToString(),
            DOB = employee.DOB,
            DOJ = employee.DOJ,
            DepartmentId = employee.DepartmentId,
            RoleId = employee.RoleId,
            Status = employee.Status,
            CreatedOn = employee.CreatedOn,
            UpdatedOn = employee.UpdatedOn,
            DepartmentName = department?.DepartmentName,
            RoleName = role?.RoleName
        };
    }
}