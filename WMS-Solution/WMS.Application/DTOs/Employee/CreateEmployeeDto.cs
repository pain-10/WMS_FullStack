using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Employee;

public class CreateEmployeeDto
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = "";

    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = "";

    [Required]
    [EmailAddress]
    [StringLength(80)]
    public string Email { get; set; } = "";

    [Required]
    [RegularExpression(@"^\d{10}$")]
    public string PhoneNumber { get; set; } = "";

    [Required]
    [RegularExpression("^[MFO]$")]
    public string Gender { get; set; } = "";

    [Required]
    public DateTime DOB { get; set; }

    [Required]
    public DateTime DOJ { get; set; }

    [Range(1, int.MaxValue)]
    public int DepartmentId { get; set; }

    [Range(1, int.MaxValue)]
    public int RoleId { get; set; }

    [RegularExpression("^(Active|Inactive)$")]
    public string Status { get; set; } = "Active";
}
