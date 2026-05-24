using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Employee;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeeController(
        IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(
            await _employeeService.GetAllAsync());
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult> GetById(
        int id)
    {
        if (User.IsInRole("Employee") && GetCurrentEmployeeId() != id)
        {
            return Forbid();
        }

        return Ok(
            await _employeeService.GetByIdAsync(id));
    }

    [HttpGet("me")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult> GetMe()
    {
        return Ok(
            await _employeeService.GetByIdAsync(GetCurrentEmployeeId()));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        CreateEmployeeDto dto)
    {
        return Ok(
            await _employeeService.CreateAsync(dto));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateEmployeeDto dto)
    {
        return Ok(
            await _employeeService.UpdateAsync(
                id,
                dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        int id)
    {
        var deleted = await _employeeService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    private int GetCurrentEmployeeId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var employeeId) ? employeeId : 0;
    }
}
