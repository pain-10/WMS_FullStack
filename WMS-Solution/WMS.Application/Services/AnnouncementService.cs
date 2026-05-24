using System.Linq;
using WMS.Application.DTOs.Announcement;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly IGenericRepository<Announcement> _announcementRepository;

    public AnnouncementService(IGenericRepository<Announcement> announcementRepository)
    {
        _announcementRepository = announcementRepository;
    }

    public async Task<AnnouncementDto> CreateAsync(CreateAnnouncementDto dto)
    {
        var announcement = new Announcement
        {
            Title = dto.Title,
            Message = dto.Message,
            CreatedBy = dto.CreatedBy,
            CreatedOn = DateTime.UtcNow,
            IsActive = true
        };

        await _announcementRepository.AddAsync(announcement);
        await _announcementRepository.SaveChangesAsync();

        return new AnnouncementDto
        {
            AnnouncementId = announcement.AnnouncementId,
            Title = announcement.Title,
            Message = announcement.Message,
            CreatedBy = announcement.CreatedBy,
            CreatedOn = announcement.CreatedOn,
            IsActive = announcement.IsActive
        };
    }

    public async Task<List<AnnouncementDto>> GetAllAsync()
    {
        var announcements = await _announcementRepository.GetAllAsync();

        return announcements.Select(a => new AnnouncementDto
        {
            AnnouncementId = a.AnnouncementId,
            Title = a.Title,
            Message = a.Message,
            CreatedBy = a.CreatedBy,
            CreatedOn = a.CreatedOn,
            IsActive = a.IsActive
        }).ToList();
    }

    public async Task<AnnouncementDto?> GetByIdAsync(int id)
    {
        var a = await _announcementRepository.GetByIdAsync(id);

        if (a == null) return null;

        return new AnnouncementDto
        {
            AnnouncementId = a.AnnouncementId,
            Title = a.Title,
            Message = a.Message,
            CreatedBy = a.CreatedBy,
            CreatedOn = a.CreatedOn,
            IsActive = a.IsActive
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var a = await _announcementRepository.GetByIdAsync(id);
        if (a == null) return false;

        _announcementRepository.Delete(a);
        await _announcementRepository.SaveChangesAsync();
        return true;
    }
}
