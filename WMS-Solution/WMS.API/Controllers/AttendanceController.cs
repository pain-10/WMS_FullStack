using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using WMS.Application.DTOs.Attendance;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AttendanceController
    : ControllerBase
{
    private readonly
        IAttendanceService
        _attendanceService;

    public AttendanceController(
        IAttendanceService
        attendanceService)
    {
        _attendanceService =
            attendanceService;
    }

    [HttpPost("checkin")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult>
        CheckIn(
        CheckInDto dto)
    {
        dto.EmployeeId = GetCurrentEmployeeId();

        return Ok(
            await _attendanceService
            .CheckInAsync(dto));
    }

    [HttpPost("checkout")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult>
        CheckOut(
        CheckOutDto dto)
    {
        dto.EmployeeId = GetCurrentEmployeeId();

        return Ok(
            await _attendanceService
            .CheckOutAsync(dto));
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult>
        GetAll()
    {
        return Ok(
            await _attendanceService
            .GetAllAsync());
    }

    [HttpGet("{employeeId}")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult>
        GetByEmployee(
        int employeeId)
    {
        if (IsEmployee() && GetCurrentEmployeeId() != employeeId)
        {
            return Forbid();
        }

        return Ok(
            await _attendanceService
            .GetByEmployeeIdAsync(
                employeeId));
    }

    [HttpGet("timesheet/{employeeId}")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult> GetTimesheet(
        int employeeId,
        DateTime fromDate,
        DateTime toDate,
        string format = "json")
    {
        if (IsEmployee() && GetCurrentEmployeeId() != employeeId)
        {
            return Forbid();
        }

        var report = await _attendanceService.GetTimesheetReportAsync(
            employeeId,
            fromDate,
            toDate);

        if (!string.Equals(format, "csv", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(report);
        }

        var csv = new StringBuilder();
        csv.AppendLine("Date,Employee,Check In,Check Out,Work Mode,Hours");
        foreach (var record in report.Records)
        {
            csv.AppendLine(string.Join(
                ",",
                record.AttendanceDate.ToString("yyyy-MM-dd"),
                EscapeCsv(report.EmployeeName ?? string.Empty),
                record.CheckInTime.ToString("HH:mm:ss"),
                record.CheckOutTime?.ToString("HH:mm:ss") ?? string.Empty,
                EscapeCsv(record.WorkMode ?? string.Empty),
                record.WorkingHours.ToString("0.##")));
        }

        csv.AppendLine($",,,Total,,{report.TotalHours:0.##}");

        return File(
            Encoding.UTF8.GetBytes(csv.ToString()),
            "text/csv",
            $"timesheet-{employeeId}-{report.FromDate:yyyyMMdd}-{report.ToDate:yyyyMMdd}.csv");
    }

    private int GetCurrentEmployeeId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var employeeId) ? employeeId : 0;
    }

    private bool IsEmployee()
    {
        return User.IsInRole("Employee");
    }

    private static string EscapeCsv(string value)
    {
        return value.Contains(',') || value.Contains('"')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
    }
}
