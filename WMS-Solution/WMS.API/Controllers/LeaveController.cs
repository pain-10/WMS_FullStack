using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WMS.Application.DTOs.Leave;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class LeaveController
    : ControllerBase
{
    private readonly
        ILeaveService
        _leaveService;

    public LeaveController(
        ILeaveService
        leaveService)
    {
        _leaveService =
            leaveService;
    }

    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult>
        Create(
        CreateLeaveDto dto)
    {
        dto.EmployeeId = GetCurrentEmployeeId();

        return Ok(
            await _leaveService
            .CreateAsync(dto));
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult>
        GetAll()
    {
        return Ok(
            await _leaveService
            .GetAllAsync());
    }

    [HttpGet("{employeeId}")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult>
        GetByEmployee(
        int employeeId)
    {
        // If the caller is an Employee, ensure they can only request their own leaves
        var roleClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (roleClaim == "Employee")
        {
            var idClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var currentEmployeeId) || currentEmployeeId != employeeId)
            {
                return Forbid();
            }
        }

        return Ok(
            await _leaveService
            .GetByEmployeeIdAsync(
                employeeId));
    }

    [HttpPut(
        "status/{leaveId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult>
        UpdateStatus(
        int leaveId,
        UpdateLeaveStatusDto dto)
    {
        return Ok(
            await _leaveService
            .UpdateStatusAsync(
                leaveId,
                dto,
                GetCurrentEmployeeId()));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _leaveService.DeleteAsync(
            id,
            GetCurrentEmployeeId());
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPut("cancel/{id}")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Cancel(int id)
    {
        var cancelled = await _leaveService.CancelAsync(
            id,
            GetCurrentEmployeeId());
        if (!cancelled) return BadRequest("Cannot cancel this leave request");
        return Ok();
    }

    private int GetCurrentEmployeeId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var employeeId) ? employeeId : 0;
    }
}
