using System.ComponentModel.DataAnnotations;
using System.Linq;
using WMS.Application.DTOs.Attendance;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IGenericRepository<Attendance> _attendanceRepository;
    private readonly IGenericRepository<Employee> _employeeRepository;

    public AttendanceService(
        IGenericRepository<Attendance> attendanceRepository,
        IGenericRepository<Employee> employeeRepository)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<AttendanceDto> CheckInAsync(CheckInDto dto)
    {
        var employee = await _employeeRepository.GetByIdAsync(dto.EmployeeId);
        if (employee == null)
        {
            throw new ValidationException("Employee not found");
        }

        var attendances = await _attendanceRepository.GetAllAsync();
        var today = DateTime.UtcNow.Date;
        var hasOpenAttendance = attendances.Any(a =>
            a.EmpId == dto.EmployeeId &&
            a.AttendanceDate == today &&
            a.CheckOut == null);

        if (hasOpenAttendance)
        {
            throw new ValidationException("Employee already has an active check-in today");
        }

        var attendance = new Attendance
        {
            EmpId = dto.EmployeeId,
            CheckIn = DateTime.UtcNow,
            AttendanceDate = DateTime.UtcNow.Date,
            WorkMode = dto.WorkMode
        };

        await _attendanceRepository.AddAsync(attendance);
        await _attendanceRepository.SaveChangesAsync();

        return await MapToDtoAsync(attendance);
    }

    public async Task<AttendanceDto> CheckOutAsync(CheckOutDto dto)
    {
        var attendances = await _attendanceRepository.GetAllAsync();
        var attendance = attendances
            .Where(a => a.EmpId == dto.EmployeeId && a.CheckOut == null)
            .OrderByDescending(a => a.CheckIn)
            .FirstOrDefault();

        if (attendance == null)
        {
            throw new ValidationException("No active check-in found");
        }

        attendance.CheckOut = DateTime.UtcNow;
        attendance.TotalHours = Math.Round((attendance.CheckOut.Value - attendance.CheckIn).TotalHours, 2);

        _attendanceRepository.Update(attendance);
        await _attendanceRepository.SaveChangesAsync();

        return await MapToDtoAsync(attendance);
    }

    public async Task<List<AttendanceDto>> GetAllAsync()
    {
        var attendances = await _attendanceRepository.GetAllAsync();
        var result = new List<AttendanceDto>();

        foreach (var attendance in attendances)
        {
            result.Add(await MapToDtoAsync(attendance));
        }

        return result;
    }

    public async Task<List<AttendanceDto>> GetByEmployeeIdAsync(int employeeId)
    {
        var attendances = await _attendanceRepository.GetAllAsync();
        var result = new List<AttendanceDto>();

        foreach (var attendance in attendances.Where(a => a.EmpId == employeeId))
        {
            result.Add(await MapToDtoAsync(attendance));
        }

        return result;
    }

    public async Task<TimesheetReportDto> GetTimesheetReportAsync(
        int employeeId,
        DateTime fromDate,
        DateTime toDate)
    {
        if (fromDate.Date > toDate.Date)
        {
            throw new ValidationException("From date cannot be after to date");
        }

        var employee = await _employeeRepository.GetByIdAsync(employeeId);
        if (employee == null)
        {
            throw new ValidationException("Employee not found");
        }

        var attendances = await _attendanceRepository.GetAllAsync();
        var records = attendances
            .Where(a =>
                a.EmpId == employeeId &&
                a.AttendanceDate.Date >= fromDate.Date &&
                a.AttendanceDate.Date <= toDate.Date)
            .OrderBy(a => a.AttendanceDate)
            .ThenBy(a => a.CheckIn)
            .ToList();

        var mappedRecords =
            (await Task.WhenAll(records.Select(MapToDtoAsync))).ToList();

        return new TimesheetReportDto
        {
            EmployeeId = employeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            FromDate = fromDate.Date,
            ToDate = toDate.Date,
            TotalDays = mappedRecords.Select(r => r.AttendanceDate.Date).Distinct().Count(),
            TotalHours = Math.Round(mappedRecords.Sum(r => r.WorkingHours), 2),
            Records = mappedRecords
        };
    }

    private async Task<AttendanceDto> MapToDtoAsync(Attendance attendance)
    {
        var employee = await _employeeRepository.GetByIdAsync(attendance.EmpId);

        return new AttendanceDto
        {
            AttendanceId = attendance.AttendanceId,
            EmployeeId = attendance.EmpId,
            EmployeeName = employee == null ? null : $"{employee.FirstName} {employee.LastName}",
            CheckInTime = attendance.CheckIn,
            CheckOutTime = attendance.CheckOut,
            WorkingHours = attendance.CheckOut != null ? Math.Round((attendance.CheckOut.Value - attendance.CheckIn).TotalHours, 2) : attendance.TotalHours,
            WorkMode = attendance.WorkMode,
            AttendanceDate = attendance.AttendanceDate
        };
    }
}
