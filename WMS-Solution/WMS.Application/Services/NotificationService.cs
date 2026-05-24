using WMS.Application.DTOs.Notification;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IGenericRepository<Notification> _repository;

    public NotificationService(IGenericRepository<Notification> repository)
    {
        _repository = repository;
    }

    public async Task<List<NotificationDto>> GetAllAsync()
    {
        var notifications = await _repository.GetAllAsync();
        return notifications
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => MapToDto(n))
            .ToList();
    }

    public async Task<NotificationDto> CreateAsync(string type, string title, string message, int employeeId, int? relatedId = null)
    {
        var notification = new Notification
        {
            Type = type,
            Title = title,
            Message = message,
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
            EmployeeId = employeeId,
            RelatedId = relatedId,
        };

        await _repository.AddAsync(notification);
        await _repository.SaveChangesAsync();

        return MapToDto(notification);
    }

    public async Task MarkAsReadAsync(int id)
    {
        var n = await _repository.GetByIdAsync(id);
        if (n == null) throw new KeyNotFoundException("Notification not found");
        n.IsRead = true;
        _repository.Update(n);
        await _repository.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync()
    {
        var notifications = await _repository.GetAllAsync();
        foreach (var n in notifications.Where(n => !n.IsRead))
        {
            n.IsRead = true;
            _repository.Update(n);
        }
        await _repository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var n = await _repository.GetByIdAsync(id);
        if (n == null) return false;
        _repository.Delete(n);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task ClearAllAsync()
    {
        var notifications = await _repository.GetAllAsync();
        foreach (var n in notifications)
        {
            _repository.Delete(n);
        }
        await _repository.SaveChangesAsync();
    }

    private static NotificationDto MapToDto(Notification n)
    {
        return new NotificationDto
        {
            NotificationId = n.NotificationId,
            Type = n.Type,
            Title = n.Title,
            Message = n.Message,
            CreatedAt = n.CreatedAt,
            IsRead = n.IsRead,
            EmployeeId = n.EmployeeId,
            RelatedId = n.RelatedId,
        };
    }
}
