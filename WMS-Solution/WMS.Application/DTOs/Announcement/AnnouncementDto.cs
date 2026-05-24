namespace WMS.Application.DTOs.Announcement;

public class AnnouncementDto
{
    public int AnnouncementId { get; set; }

    public string Title { get; set; } = "";

    public string Message { get; set; } = "";

    public int CreatedBy { get; set; }

    public DateTime CreatedOn { get; set; }

    public bool IsActive { get; set; }
}
