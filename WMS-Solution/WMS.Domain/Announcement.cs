using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities;

public class Announcement
{
    [Key]
    public int AnnouncementId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    public int CreatedBy { get; set; }

    // Navigation property
    public Employee? Employee { get; set; }

    public DateTime CreatedOn { get; set; }

    public bool IsActive { get; set; } = true;
}