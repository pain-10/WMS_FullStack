using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Allocation;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AllocationController : ControllerBase
{
    private readonly IAllocationService _allocationService;

    public AllocationController(IAllocationService allocationService)
    {
        _allocationService = allocationService;
    }

    // POST: api/allocation
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateAllocationDto dto)
    {
        return Ok(await _allocationService.CreateAsync(dto));
    }

    // GET: api/allocation
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _allocationService.GetAllAsync());
    }

    // GET: api/allocation/employee/5
    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        return Ok(await _allocationService.GetByEmployeeAsync(employeeId));
    }

    // GET: api/allocation/project/5
    [HttpGet("project/{projectId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetByProject(int projectId)
    {
        return Ok(await _allocationService.GetByProjectAsync(projectId));
    }

    // DELETE: api/allocation/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _allocationService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
