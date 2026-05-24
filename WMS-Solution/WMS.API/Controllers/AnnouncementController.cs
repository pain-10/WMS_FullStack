using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Announcement;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AnnouncementController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    // POST: api/announcement
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAnnouncement(CreateAnnouncementDto dto)
    {
        return Ok(await _announcementService.CreateAsync(dto));
    }

    // GET: api/announcement
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _announcementService.GetAllAsync());
    }

    // GET: api/announcement/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var a = await _announcementService.GetByIdAsync(id);
        if (a == null) return NotFound();
        return Ok(a);
    }

    // DELETE: api/announcement/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _announcementService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
