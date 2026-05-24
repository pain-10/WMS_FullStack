using System.ComponentModel.DataAnnotations;
using WMS.Application.DTOs.Leave;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class LeaveService : ILeaveService
{
    private readonly IGenericRepository<Leave> _leaveRepository;
    private readonly IGenericRepository<Employee> _employeeRepository;

    public LeaveService(
        IGenericRepository<Leave> leaveRepository,
        IGenericRepository<Employee> employeeRepository)
    {
        _leaveRepository = leaveRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<LeaveDto> CreateAsync(CreateLeaveDto dto)
    {
        if (dto.StartDate.Date < DateTime.UtcNow.Date)
        {
            throw new ValidationException("Leave start date cannot be in the past");
        }

        if (dto.EndDate.Date < DateTime.UtcNow.Date)
        {
            throw new ValidationException("Leave end date cannot be in the past");
        }

        if (dto.StartDate.Date > dto.EndDate.Date)
        {
            throw new ValidationException("Leave start date cannot be after end date");
        }

        var employee = await _employeeRepository.GetByIdAsync(dto.EmployeeId);
        if (employee == null)
        {
            throw new ValidationException("Employee not found");
        }

        var existingLeaves = await _leaveRepository.GetAllAsync();
        var overlapping = existingLeaves.Any(l =>
            l.EmpId == dto.EmployeeId &&
            l.Status == "Pending" &&
            dto.StartDate.Date <= l.ToDate.Date &&
            dto.EndDate.Date >= l.FromDate.Date);

        if (overlapping)
        {
            throw new ValidationException("Leave request overlaps with an existing pending leave");
        }

        var leave = new Leave
        {
            EmpId = dto.EmployeeId,
            LeaveType = dto.LeaveType,
            FromDate = dto.StartDate,
            ToDate = dto.EndDate,
            Reason = dto.Reason,
            Status = "Pending",
            AppliedOn = DateTime.UtcNow
        };

        await _leaveRepository.AddAsync(leave);
        await _leaveRepository.SaveChangesAsync();

        return await MapToDtoAsync(leave);
    }

    public async Task<bool> DeleteAsync(int id, int? employeeId = null)
    {
        return await CancelAsync(id, employeeId);
    }

    public async Task<bool> CancelAsync(int id, int? employeeId = null)
    {
        var leave = await _leaveRepository.GetByIdAsync(id);
        if (leave == null)
        {
            return false;
        }

        if (employeeId.HasValue && leave.EmpId != employeeId.Value)
        {
            return false;
        }

        if (!string.Equals(leave.Status, "Pending", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        leave.Status = "Cancelled";
        _leaveRepository.Update(leave);
        await _leaveRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<LeaveDto>> GetAllAsync()
    {
        var leaves = await _leaveRepository.GetAllAsync();
        var result = new List<LeaveDto>();

        foreach (var leave in leaves)
        {
            result.Add(await MapToDtoAsync(leave));
        }

        return result;
    }

    public async Task<List<LeaveDto>> GetByEmployeeIdAsync(int employeeId)
    {
        var leaves = await _leaveRepository.GetAllAsync();
        var result = new List<LeaveDto>();

        foreach (var leave in leaves.Where(l => l.EmpId == employeeId))
        {
            result.Add(await MapToDtoAsync(leave));
        }

        return result;
    }

    public async Task<LeaveDto> UpdateStatusAsync(
        int leaveId,
        UpdateLeaveStatusDto dto,
        int approvedBy)
    {
        var leave = await _leaveRepository.GetByIdAsync(leaveId);
        if (leave == null)
        {
            throw new KeyNotFoundException("Leave request not found");
        }

        if (!string.Equals(leave.Status, "Pending", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("Only pending leave requests can be approved or rejected");
        }

        leave.Status = dto.Status;
        leave.ApprovedBy = approvedBy;
        leave.ApprovedOn = DateTime.UtcNow;

        _leaveRepository.Update(leave);
        await _leaveRepository.SaveChangesAsync();

        return await MapToDtoAsync(leave);
    }

    private async Task<LeaveDto> MapToDtoAsync(Leave leave)
    {
        var employee = await _employeeRepository.GetByIdAsync(leave.EmpId);

        return new LeaveDto
        {
            LeaveId = leave.LeaveId,
            EmployeeId = leave.EmpId,
            EmployeeName = employee == null ? null : $"{employee.FirstName} {employee.LastName}",
            LeaveType = leave.LeaveType,
            StartDate = leave.FromDate,
            EndDate = leave.ToDate,
            Reason = leave.Reason ?? string.Empty,
            Status = leave.Status,
            AppliedOn = leave.AppliedOn,
            ApprovedBy = leave.ApprovedBy,
            ApprovedOn = leave.ApprovedOn
        };
    }
}
