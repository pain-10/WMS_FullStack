using System.Linq;
using WMS.Application.DTOs.Audit;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class AuditService : IAuditService
{
    private readonly IGenericRepository<AuditLog> _auditRepository;

    public AuditService(IGenericRepository<AuditLog> auditRepository)
    {
        _auditRepository = auditRepository;
    }

    public async Task LogAsync(int employeeId, string entityName, int recordId, string action, string description)
    {
        var log = new AuditLog
        {
            EntityName = entityName,
            RecordId = recordId,
            Action = action,
            CreatedBy = employeeId,
            CreatedOn = DateTime.UtcNow
        };

        await _auditRepository.AddAsync(log);
        await _auditRepository.SaveChangesAsync();
    }

    public async Task<List<AuditDto>> GetAllAsync()
    {
        var logs = await _auditRepository.GetAllAsync();
        return logs.Select(l => new AuditDto
        {
            AuditId = l.AuditId,
            EmployeeId = l.CreatedBy,
            Action = l.Action,
            Description = l.EntityName + "#" + l.RecordId,
            CreatedAt = l.CreatedOn
        }).ToList();
    }

    public async Task<List<AuditDto>> GetByEmployeeAsync(int employeeId)
    {
        var logs = await _auditRepository.GetAllAsync();
        return logs.Where(l => l.CreatedBy == employeeId).Select(l => new AuditDto
        {
            AuditId = l.AuditId,
            EmployeeId = l.CreatedBy,
            Action = l.Action,
            Description = l.EntityName + "#" + l.RecordId,
            CreatedAt = l.CreatedOn
        }).ToList();
    }
}
