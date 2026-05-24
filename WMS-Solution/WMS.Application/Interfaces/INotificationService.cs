using WMS.Application.DTOs.Notification;

namespace WMS.Application.Interfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetAllAsync();
    Task<NotificationDto> CreateAsync(string type, string title, string message, int employeeId, int? relatedId = null);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync();
    Task<bool> DeleteAsync(int id);
    Task ClearAllAsync();
}
