using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Leave;

public class UpdateLeaveStatusDto
{
    [Required]
    [RegularExpression("^(Approved|Rejected)$")]
    public string Status { get; set; } = "";
}
