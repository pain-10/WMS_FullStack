namespace WMS.Application.DTOs.Audit;

public class AuditDto
{
    public int AuditId { get; set; }

    public int EmployeeId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
