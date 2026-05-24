using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Project;

public class CreateProjectDto
{
    [Required]
    [StringLength(100)]
    public string ProjectName { get; set; } = "";

    [StringLength(255)]
    public string Description { get; set; } = "";

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public int ClientId { get; set; }

    [RegularExpression("^(Active|Completed)$")]
    public string Status { get; set; } = "Active";
}
