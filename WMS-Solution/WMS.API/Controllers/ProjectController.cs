using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WMS.Application.DTOs.Project;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProjectController
    : ControllerBase
{
    private readonly
        IProjectService
        _projectService;

    public ProjectController(
        IProjectService projectService)
    {
        _projectService =
            projectService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        Create(
        CreateProjectDto dto)
    {
        return Ok(
            await _projectService
            .CreateAsync(dto));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateProjectDto dto)
    {
        return Ok(await _projectService.UpdateAsync(id, dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _projectService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult>
        GetAll()
    {
        return Ok(
            await _projectService
            .GetAllAsync());
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult>
        GetById(int id)
    {
        return Ok(
            await _projectService
            .GetByIdAsync(id));
    }

    [HttpPost("allocate")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult>
        Allocate(
        AllocateEmployeeDto dto)
    {
        await _projectService
            .AllocateEmployeeAsync(dto);

        return Ok(
            "Employee allocated successfully");
    }

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult>
        GetEmployeeProjects(
        int employeeId)
    {
        if (User.IsInRole("Employee") && GetCurrentEmployeeId() != employeeId)
        {
            return Forbid();
        }

        return Ok(
            await _projectService
                .GetProjectsByEmployeeAsync(
                    employeeId));
    }

    private int GetCurrentEmployeeId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var employeeId) ? employeeId : 0;
    }
}
