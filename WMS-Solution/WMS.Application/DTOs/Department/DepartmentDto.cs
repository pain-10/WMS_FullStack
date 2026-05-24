namespace WMS.Application.DTOs.Department;

public class DepartmentDto
{
    public int DepartmentId { get; set; }

    public string DepartmentName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedOn { get; set; }
}