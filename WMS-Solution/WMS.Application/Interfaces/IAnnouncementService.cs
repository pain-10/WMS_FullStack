using WMS.Application.DTOs.Announcement;

namespace WMS.Application.Interfaces;

public interface IAnnouncementService
{
    Task<AnnouncementDto> CreateAsync(CreateAnnouncementDto dto);

    Task<List<AnnouncementDto>> GetAllAsync();

    Task<AnnouncementDto?> GetByIdAsync(int id);

    Task<bool> DeleteAsync(int id);
}
