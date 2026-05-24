using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities;

public class Employee
{
    [Key]
    public int EmployeeId { get; set; }

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(80)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(15)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public char Gender { get; set; }

    [Required]
    public DateTime DOB { get; set; }

    [Required]
    public DateTime DOJ { get; set; }

    [Required]
    public int DepartmentId { get; set; }

    public Department? Department { get; set; }

    [Required]
    public int RoleId { get; set; }

    public Role? Role { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Active";

    public DateTime CreatedOn { get; set; }

    public DateTime? UpdatedOn { get; set; }
}