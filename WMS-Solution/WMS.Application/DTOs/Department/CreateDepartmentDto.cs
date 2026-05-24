using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Department;

public class CreateDepartmentDto
{
    [Required]
    [StringLength(100)]
    public string DepartmentName { get; set; } = string.Empty;

    [StringLength(255)]
    public string? Description { get; set; }
}
