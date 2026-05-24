namespace WMS.Application.DTOs.Attendance;

public class AttendanceDto
{
    public int AttendanceId { get; set; }

    public int EmployeeId { get; set; }

    public string? EmployeeName { get; set; }

    public DateTime CheckInTime { get; set; }

    public DateTime? CheckOutTime { get; set; }

    public double WorkingHours { get; set; }

    public string? WorkMode { get; set; }

    public DateTime AttendanceDate { get; set; }
}