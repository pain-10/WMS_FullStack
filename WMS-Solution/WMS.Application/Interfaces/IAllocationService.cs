using WMS.Application.DTOs.Allocation;

namespace WMS.Application.Interfaces;

public interface IAllocationService
{
    Task<AllocationDto> CreateAsync(CreateAllocationDto dto);

    Task<List<AllocationDto>> GetAllAsync();

    Task<List<AllocationDto>> GetByEmployeeAsync(int employeeId);

    Task<List<AllocationDto>> GetByProjectAsync(int projectId);

    Task<bool> DeleteAsync(int id);
}
