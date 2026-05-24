using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities;

public class Attendance
{
    [Key]
    public int AttendanceId { get; set; }

    [Required]
    public int EmpId { get; set; }

    // Navigation property
    public Employee? Employee { get; set; }

    [Required]
    public DateTime CheckIn { get; set; }

    public DateTime? CheckOut { get; set; }

    // Computed in service/business logic
    public double TotalHours { get; set; }

    [MaxLength(20)]
    public string? WorkMode { get; set; }   // WFO/WFH/Hybrid

    [Required]
    public DateTime AttendanceDate { get; set; }
}