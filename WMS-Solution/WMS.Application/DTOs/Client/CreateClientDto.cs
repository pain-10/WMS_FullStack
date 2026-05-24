using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Client;

public class CreateClientDto
{
    [Required]
    [StringLength(100)]
    public string ClientName { get; set; } = "";

    public string? ClientAddress { get; set; }

    [RegularExpression(@"^\d{10}$")]
    public string? ClientPhoneNumber { get; set; }

    [StringLength(20)]
    public string? ClientLocation { get; set; }

    public bool Status { get; set; } = true;
}
