using WMS.Application.DTOs.Audit;

namespace WMS.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(int employeeId, string entityName, int recordId, string action, string description);

    Task<List<AuditDto>> GetAllAsync();

    Task<List<AuditDto>> GetByEmployeeAsync(int employeeId);
}
