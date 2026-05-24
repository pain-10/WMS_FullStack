namespace WMS.Application.DTOs.Report;

public class TimesheetFilterDto
{
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public int? DepartmentId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string Period { get; set; } = "daily";
}
