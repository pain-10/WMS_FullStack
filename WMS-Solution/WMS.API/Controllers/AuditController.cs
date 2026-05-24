using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Manager")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _auditService.GetAllAsync());
    }

    [HttpGet("{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        return Ok(await _auditService.GetByEmployeeAsync(employeeId));
    }
}
