namespace WMS.Application.DTOs.Report;

public class TimesheetExportRowDto
{
    public string? EmployeeName { get; set; }
    public int EmployeeId { get; set; }
    public DateTime AttendanceDate { get; set; }
    public string CheckInTime { get; set; } = string.Empty;
    public string? CheckOutTime { get; set; }
    public double WorkingHours { get; set; }
    public string? WorkMode { get; set; }
    public string Period { get; set; } = "Daily";
}
