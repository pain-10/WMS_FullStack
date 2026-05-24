namespace WMS.Application.DTOs.Attendance;

public class TimesheetReportDto
{
    public int EmployeeId { get; set; }

    public string? EmployeeName { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public double TotalHours { get; set; }

    public int TotalDays { get; set; }

    public List<AttendanceDto> Records { get; set; } = [];
}
