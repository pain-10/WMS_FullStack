namespace WMS.Application.DTOs.Employee;

public class EmployeeDto
{
    public int EmployeeId { get; set; }

    public string FirstName { get; set; } = "";

    public string LastName { get; set; } = "";

    public string Email { get; set; } = "";

    public string PhoneNumber { get; set; } = "";

    public string Gender { get; set; } = "";

    public DateTime DOB { get; set; }

    public DateTime DOJ { get; set; }

    public int DepartmentId { get; set; }

    public int RoleId { get; set; }

    public string Status { get; set; } = "Active";

    public DateTime CreatedOn { get; set; }

    public DateTime? UpdatedOn { get; set; }

    public string? DepartmentName { get; set; }

    public string? RoleName { get; set; }
}