using System.ComponentModel.DataAnnotations;
using WMS.Application.DTOs.Report;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ClosedXML.Excel;

namespace WMS.Application.Services;

public class ReportService : IReportService
{
    private readonly IGenericRepository<Attendance> _attendanceRepository;
    private readonly IGenericRepository<Employee> _employeeRepository;
    private readonly IGenericRepository<Department> _departmentRepository;

    public ReportService(
        IGenericRepository<Attendance> attendanceRepository,
        IGenericRepository<Employee> employeeRepository,
        IGenericRepository<Department> departmentRepository)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<List<TimesheetExportRowDto>> GetTimesheetReportAsync(
        int? employeeId, string? employeeName, int? departmentId,
        DateTime? fromDate, DateTime? toDate, string period)
    {
        var attendances = (await _attendanceRepository.GetAllAsync()).AsEnumerable();
        var employees = (await _employeeRepository.GetAllAsync()).ToList();

        if (employeeId.HasValue)
            attendances = attendances.Where(a => a.EmpId == employeeId.Value);

        int? empIdByName = null;
        if (!string.IsNullOrWhiteSpace(employeeName))
        {
            var matched = employees.FirstOrDefault(e =>
                $"{e.FirstName} {e.LastName}".Contains(employeeName, StringComparison.OrdinalIgnoreCase));
            if (matched != null)
                empIdByName = matched.EmployeeId;
        }

        if (departmentId.HasValue)
        {
            var deptEmpIds = employees
                .Where(e => e.DepartmentId == departmentId.Value)
                .Select(e => e.EmployeeId)
                .ToHashSet();
            attendances = attendances.Where(a => deptEmpIds.Contains(a.EmpId));
        }

        var startDate = fromDate?.Date ?? DateTime.UtcNow.Date.AddDays(-30);
        var endDate = toDate?.Date ?? DateTime.UtcNow.Date;

        if (startDate > endDate)
            throw new ValidationException("From date cannot be after to date");

        attendances = attendances.Where(a =>
            a.AttendanceDate >= startDate && a.AttendanceDate <= endDate);

        var records = attendances
            .OrderBy(a => a.EmpId)
            .ThenBy(a => a.AttendanceDate)
            .ThenBy(a => a.CheckIn)
            .ToList();

        var result = new List<TimesheetExportRowDto>();
        foreach (var a in records)
        {
            var emp = employees.FirstOrDefault(e => e.EmployeeId == a.EmpId);
            var empName = emp == null ? "Unknown" : $"{emp.FirstName} {emp.LastName}";

            if (empIdByName.HasValue && a.EmpId != empIdByName.Value)
                continue;

            if (!string.IsNullOrWhiteSpace(employeeName) && empIdByName == null)
                continue;

            result.Add(new TimesheetExportRowDto
            {
                EmployeeName = empName,
                EmployeeId = a.EmpId,
                AttendanceDate = a.AttendanceDate,
                CheckInTime = a.CheckIn.ToString("HH:mm:ss"),
                CheckOutTime = a.CheckOut?.ToString("HH:mm:ss"),
                WorkingHours = a.CheckOut.HasValue
                    ? Math.Round((a.CheckOut.Value - a.CheckIn).TotalHours, 2)
                    : a.TotalHours,
                WorkMode = a.WorkMode,
                Period = GetPeriodLabel(a.AttendanceDate, period)
            });
        }

        return result;
    }

    public async Task<byte[]> ExportTimesheetPdfAsync(
        int? employeeId, string? employeeName, int? departmentId,
        DateTime? fromDate, DateTime? toDate, string period)
    {
        var data = await GetTimesheetReportAsync(employeeId, employeeName, departmentId, fromDate, toDate, period);

        var startDate = fromDate?.Date ?? DateTime.UtcNow.Date.AddDays(-30);
        var endDate = toDate?.Date ?? DateTime.UtcNow.Date;

        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeHeader(c, startDate, endDate));
                page.Content().Element(c => ComposeContent(c, data, period));
                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Generated on ");
                    text.Span(DateTime.Now.ToString("yyyy-MM-dd HH:mm"));
                    text.Span(" | Page ");
                    text.CurrentPageNumber();
                });
            });
        });

        using var stream = new MemoryStream();
        doc.GeneratePdf(stream);
        return stream.ToArray();
    }

    public async Task<byte[]> ExportTimesheetExcelAsync(
        int? employeeId, string? employeeName, int? departmentId,
        DateTime? fromDate, DateTime? toDate, string period)
    {
        var data = await GetTimesheetReportAsync(employeeId, employeeName, departmentId, fromDate, toDate, period);

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Timesheet");

        ws.Cell(1, 1).Value = "Employee Name";
        ws.Cell(1, 2).Value = "Employee ID";
        ws.Cell(1, 3).Value = "Attendance Date";
        ws.Cell(1, 4).Value = "Check In";
        ws.Cell(1, 5).Value = "Check Out";
        ws.Cell(1, 6).Value = "Total Hours";
        ws.Cell(1, 7).Value = "Work Mode";
        ws.Cell(1, 8).Value = "Period";

        var headerRange = ws.Range(1, 1, 1, 8);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#1F4E79");
        headerRange.Style.Font.FontColor = XLColor.White;

        int row = 2;
        foreach (var item in data)
        {
            ws.Cell(row, 1).Value = item.EmployeeName ?? "";
            ws.Cell(row, 2).Value = item.EmployeeId;
            ws.Cell(row, 3).Value = item.AttendanceDate.ToString("yyyy-MM-dd");
            ws.Cell(row, 4).Value = item.CheckInTime;
            ws.Cell(row, 5).Value = item.CheckOutTime ?? "";
            ws.Cell(row, 6).Value = item.WorkingHours;
            ws.Cell(row, 7).Value = item.WorkMode ?? "";
            ws.Cell(row, 8).Value = item.Period;
            row++;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void ComposeHeader(IContainer container, DateTime from, DateTime to)
    {
        container.Column(col =>
        {
            col.Item().Text("Employee Timesheet Report")
                .FontSize(18).Bold().FontColor(Colors.Blue.Darken3);

            col.Item().Text($"Period: {from:yyyy-MM-dd} to {to:yyyy-MM-dd}")
                .FontSize(11).FontColor(Colors.Grey.Darken2);

            col.Item().PaddingBottom(8);
        });
    }

    private static void ComposeContent(IContainer container, List<TimesheetExportRowDto> data, string period)
    {
        if (data.Count == 0)
        {
            container.Text("No records found for the selected filters.").FontSize(12).FontColor(Colors.Red.Medium);
            return;
        }

        double grandTotal = data.Sum(d => d.WorkingHours);

        container.Column(col =>
        {
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.RelativeColumn(2);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1.5f);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                });

                table.Header(h =>
                {
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("Employee").Bold().FontSize(9).FontColor(Colors.White);
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("ID").Bold().FontSize(9).FontColor(Colors.White);
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("Date").Bold().FontSize(9).FontColor(Colors.White);
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("In").Bold().FontSize(9).FontColor(Colors.White);
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("Out").Bold().FontSize(9).FontColor(Colors.White);
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("Hours").Bold().FontSize(9).FontColor(Colors.White);
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("Mode").Bold().FontSize(9).FontColor(Colors.White);
                    h.Cell().Background(Colors.Blue.Darken3).Padding(3).Text("Period").Bold().FontSize(9).FontColor(Colors.White);
                });

                foreach (var item in data)
                {
                    var bg = data.IndexOf(item) % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                    table.Cell().Background(bg).Padding(2).Text(item.EmployeeName ?? "").FontSize(8);
                    table.Cell().Background(bg).Padding(2).Text(item.EmployeeId.ToString()).FontSize(8);
                    table.Cell().Background(bg).Padding(2).Text(item.AttendanceDate.ToString("yyyy-MM-dd")).FontSize(8);
                    table.Cell().Background(bg).Padding(2).Text(item.CheckInTime).FontSize(8);
                    table.Cell().Background(bg).Padding(2).Text(item.CheckOutTime ?? "-").FontSize(8);
                    table.Cell().Background(bg).Padding(2).Text(item.WorkingHours.ToString("0.##")).FontSize(8);
                    table.Cell().Background(bg).Padding(2).Text(item.WorkMode ?? "-").FontSize(8);
                    table.Cell().Background(bg).Padding(2).Text(item.Period).FontSize(8);
                }
            });

            col.Item().PaddingTop(10).AlignRight().Text($"Grand Total Hours: {grandTotal:0.##}")
                .FontSize(12).Bold();
        });
    }

    private static string GetPeriodLabel(DateTime date, string period)
    {
        return period.ToLower() switch
        {
            "weekly" => $"Week {GetWeekNumber(date)}, {GetWeekYear(date)}",
            "monthly" => date.ToString("MMMM yyyy"),
            _ => date.ToString("dddd")
        };
    }

    private static int GetWeekNumber(DateTime date)
    {
        var ci = System.Globalization.CultureInfo.CurrentCulture;
        return ci.Calendar.GetWeekOfYear(date, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
    }

    private static int GetWeekYear(DateTime date)
    {
        return date.Year;
    }
}
