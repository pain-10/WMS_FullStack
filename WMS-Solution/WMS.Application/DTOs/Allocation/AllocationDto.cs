namespace WMS.Application.DTOs.Allocation;

public class AllocationDto
{
    public int AllocationId { get; set; }

    public int EmployeeId { get; set; }

    public string? EmployeeName { get; set; }

    public int ProjectId { get; set; }

    public string? ProjectName { get; set; }

    public DateTime AssignedOn { get; set; }

    public DateTime CreateDate { get; set; }

    public string CreatedBy { get; set; } = string.Empty;

    public bool Status { get; set; }

    public string? UpdatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
