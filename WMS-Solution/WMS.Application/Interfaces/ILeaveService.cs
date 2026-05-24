using WMS.Application.DTOs.Leave;

namespace WMS.Application.Interfaces;

public interface ILeaveService
{
    Task<LeaveDto> CreateAsync(
        CreateLeaveDto dto);

    Task<bool> DeleteAsync(
        int id,
        int? employeeId = null);

    Task<bool> CancelAsync(
        int id,
        int? employeeId = null);

    Task<List<LeaveDto>> GetAllAsync();

    Task<List<LeaveDto>> GetByEmployeeIdAsync(
        int employeeId);

    Task<LeaveDto> UpdateStatusAsync(
        int leaveId,
        UpdateLeaveStatusDto dto,
        int approvedBy);
}
