using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Attendance;

public class CheckInDto
{
    public int EmployeeId { get; set; }

    [Required]
    [RegularExpression("^(WFO|WFH|Hybrid)$")]
    public string WorkMode { get; set; } = "WFO";
}
