using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Client;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ClientController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientController(IClientService clientService)
    {
        _clientService = clientService;
    }

    // POST: api/client
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateClientDto dto)
    {
        return Ok(await _clientService.CreateAsync(dto));
    }

    // GET: api/client
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _clientService.GetAllAsync());
    }

    // GET: api/client/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await _clientService.GetByIdAsync(id);
        if (c == null) return NotFound();
        return Ok(c);
    }

    // PUT: api/client/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateClientDto dto)
    {
        return Ok(await _clientService.UpdateAsync(id, dto));
    }

    // DELETE: api/client/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _clientService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
