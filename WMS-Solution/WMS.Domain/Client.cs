using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities;

public class Client
{
    [Key]
    public int ClientId { get; set; }

    [Required]
    [MaxLength(100)]
    public string ClientName { get; set; } = string.Empty;

    public string? ClientAddress { get; set; }

    [RegularExpression(@"^\d{10}$",
        ErrorMessage = "Phone number must contain exactly 10 digits.")]
    public string? ClientPhoneNumber { get; set; }

    [MaxLength(20)]
    public string? ClientLocation { get; set; }

    public bool Status { get; set; } = true;

    // Navigation property
    public ICollection<Project>? Projects { get; set; }
}