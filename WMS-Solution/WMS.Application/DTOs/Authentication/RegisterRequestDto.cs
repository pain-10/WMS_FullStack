using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "First Name is required")]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last Name is required")]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress]
    [MaxLength(80)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone Number is required")]
    [RegularExpression(@"^\d{10}$",
        ErrorMessage = "Phone number must contain 10 digits")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public char Gender { get; set; }

    [Required]
    public DateTime DOB { get; set; }

    [Required]
    public DateTime DOJ { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "DepartmentId must be at least 1")]
    public int DepartmentId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "RoleId must be at least 1")]
    public int RoleId { get; set; }
}