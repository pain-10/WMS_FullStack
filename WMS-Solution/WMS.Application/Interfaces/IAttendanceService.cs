using WMS.Application.DTOs.Attendance;

namespace WMS.Application.Interfaces;

public interface IAttendanceService
{
    Task<AttendanceDto> CheckInAsync(
        CheckInDto dto);

    Task<AttendanceDto> CheckOutAsync(
        CheckOutDto dto);

    Task<List<AttendanceDto>> GetAllAsync();

    Task<List<AttendanceDto>> GetByEmployeeIdAsync(
        int employeeId);

    Task<TimesheetReportDto> GetTimesheetReportAsync(
        int employeeId,
        DateTime fromDate,
        DateTime toDate);
}
