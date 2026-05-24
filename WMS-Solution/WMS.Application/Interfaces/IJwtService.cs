namespace WMS.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(
        int employeeId,
        string username,
        string role);
}