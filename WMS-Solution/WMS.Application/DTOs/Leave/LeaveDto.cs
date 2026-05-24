namespace WMS.Application.DTOs.Leave;

public class LeaveDto
{
    public int LeaveId { get; set; }

    public int EmployeeId { get; set; }

    public string? EmployeeName { get; set; }

    public string LeaveType { get; set; } = "";

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string Reason { get; set; } = "";

    public string Status { get; set; } = "";

    public DateTime AppliedOn { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedOn { get; set; }
}