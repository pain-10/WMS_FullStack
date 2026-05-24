using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities;

public class EmployeeProjectAllocation
{
    [Key]
    public int AllocationId { get; set; }

    [Required]
    public int EmpId { get; set; }

    // Navigation property
    public Employee? Employee { get; set; }

    [Required]
    public int ProjectId { get; set; }

    // Navigation property
    public Project? Project { get; set; }

    [Required]
    public DateTime AssignedOn { get; set; }

    [Required]
    public DateTime CreateDate { get; set; } 

    [Required]
    [MaxLength(50)]
    public string CreatedBy { get; set; } = string.Empty;

    public bool Status { get; set; } = true;

    [MaxLength(50)]
    public string? UpdatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }
}