using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Announcement;

public class CreateAnnouncementDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = "";

    [Required]
    public string Message { get; set; } = "";

    [Range(1, int.MaxValue)]
    public int CreatedBy { get; set; }
}
