using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities;

public class Leave
{
    [Key]
    public int LeaveId { get; set; }

    [Required]
    public int EmpId { get; set; }

    // Navigation property
    public Employee? Employee { get; set; }

    [Required]
    [MaxLength(30)]
    public string LeaveType { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Reason { get; set; }

    [Required]
    public DateTime FromDate { get; set; }

    [Required]
    public DateTime ToDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public DateTime AppliedOn { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedOn { get; set; }
}