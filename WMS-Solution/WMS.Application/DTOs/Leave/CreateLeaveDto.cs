using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Leave;

public class CreateLeaveDto
{
    [Range(1, int.MaxValue)]
    public int EmployeeId { get; set; }

    [Required]
    [RegularExpression("^(Sick|Casual|Earned)$")]
    public string LeaveType { get; set; } = "";

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [StringLength(255)]
    public string Reason { get; set; } = "";
}
