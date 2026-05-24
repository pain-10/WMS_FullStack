using WMS.Application.DTOs.Employee;

namespace WMS.Application.Interfaces;

public interface IEmployeeService
{
    Task<List<EmployeeDto>> GetAllAsync();

    Task<EmployeeDto?> GetByIdAsync(
        int id);

    Task<EmployeeDto> CreateAsync(
        CreateEmployeeDto dto);

    Task<EmployeeDto> UpdateAsync(
        int id,
        UpdateEmployeeDto dto);

    Task<bool> DeleteAsync(
        int id);
}