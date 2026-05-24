namespace WMS.Application.DTOs.Project;

public class ProjectDto
{
    public int ProjectId { get; set; }

    public string ProjectName { get; set; } = "";

    public string Description { get; set; } = "";

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public int ClientId { get; set; }

    public string Status { get; set; } = "Active";

    public string? ClientName { get; set; }
}