using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Allocation;

public class CreateAllocationDto
{
    [Range(1, int.MaxValue)]
    public int EmployeeId { get; set; }

    [Range(1, int.MaxValue)]
    public int ProjectId { get; set; }
}
