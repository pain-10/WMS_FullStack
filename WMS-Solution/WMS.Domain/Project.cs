using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Domain.Entities;

public class Project
{
    [Key]
    public int ProjectId { get; set; }

    [Required]
    [MaxLength(100)]
    public string ProjectName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public int? ClientId { get; set; }

    // Navigation property
    public Client? Client { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Active";

    // Navigation property
    public ICollection<EmployeeProjectAllocation>? EmployeeAllocations { get; set; }
}