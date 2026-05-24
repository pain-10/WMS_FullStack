using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities;

public class Role
{
    [Key]
    public int RoleId { get; set; }

    [Required]
    [MaxLength(50)]
    public string RoleName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Description { get; set; }

    // Navigation properties
    public ICollection<Employee>? Employees { get; set; }

    public ICollection<UserLogin>? UserLogins { get; set; }
}