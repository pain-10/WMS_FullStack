using WMS.Application.DTOs.Report;

namespace WMS.Application.Interfaces;

public interface IReportService
{
    Task<List<TimesheetExportRowDto>> GetTimesheetReportAsync(
        int? employeeId, string? employeeName, int? departmentId,
        DateTime? fromDate, DateTime? toDate, string period);

    Task<byte[]> ExportTimesheetPdfAsync(
        int? employeeId, string? employeeName, int? departmentId,
        DateTime? fromDate, DateTime? toDate, string period);

    Task<byte[]> ExportTimesheetExcelAsync(
        int? employeeId, string? employeeName, int? departmentId,
        DateTime? fromDate, DateTime? toDate, string period);
}
