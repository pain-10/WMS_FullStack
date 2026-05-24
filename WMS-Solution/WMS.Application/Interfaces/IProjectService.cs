using WMS.Application.DTOs.Project;

namespace WMS.Application.Interfaces;

public interface IProjectService
{
    Task<ProjectDto> CreateAsync(
        CreateProjectDto dto);

    Task<ProjectDto> UpdateAsync(
        int id,
        CreateProjectDto dto);

    Task<bool> DeleteAsync(
        int id);

    Task<List<ProjectDto>> GetAllAsync();

    Task<ProjectDto?> GetByIdAsync(
        int id);

    Task AllocateEmployeeAsync(
        AllocateEmployeeDto dto);

    Task<List<ProjectDto>>
        GetProjectsByEmployeeAsync(
            int employeeId);
}