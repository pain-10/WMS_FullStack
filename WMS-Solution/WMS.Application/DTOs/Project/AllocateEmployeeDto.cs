using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Project;

public class AllocateEmployeeDto
{
    [Range(1, int.MaxValue)]
    public int EmployeeId { get; set; }

    [Range(1, int.MaxValue)]
    public int ProjectId { get; set; }
}
