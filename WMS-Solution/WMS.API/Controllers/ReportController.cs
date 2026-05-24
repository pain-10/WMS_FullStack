using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Report;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("timesheet")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult> GetTimesheetReport(
        [FromQuery] TimesheetFilterDto filter)
    {
        if (User.IsInRole("Employee") && filter.EmployeeId.HasValue)
        {
            var currentId = GetCurrentEmployeeId();
            if (filter.EmployeeId != currentId)
                return Forbid();
        }

        if (User.IsInRole("Employee"))
            filter.EmployeeId = GetCurrentEmployeeId();

        var result = await _reportService.GetTimesheetReportAsync(
            filter.EmployeeId, filter.EmployeeName, filter.DepartmentId,
            filter.FromDate, filter.ToDate, filter.Period);

        return Ok(result);
    }

    [HttpGet("timesheet/export/pdf")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> ExportTimesheetPdf(
        [FromQuery] TimesheetFilterDto filter)
    {
        var pdf = await _reportService.ExportTimesheetPdfAsync(
            filter.EmployeeId, filter.EmployeeName, filter.DepartmentId,
            filter.FromDate, filter.ToDate, filter.Period);

        return File(pdf, "application/pdf", $"timesheet-{DateTime.Now:yyyyMMdd-HHmmss}.pdf");
    }

    [HttpGet("timesheet/export/excel")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> ExportTimesheetExcel(
        [FromQuery] TimesheetFilterDto filter)
    {
        var excel = await _reportService.ExportTimesheetExcelAsync(
            filter.EmployeeId, filter.EmployeeName, filter.DepartmentId,
            filter.FromDate, filter.ToDate, filter.Period);

        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"timesheet-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx");
    }

    private int GetCurrentEmployeeId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var employeeId) ? employeeId : 0;
    }
}
