namespace WMS.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int TotalEmployees { get; set; }

    public int ActiveEmployees { get; set; }

    public int TotalProjects { get; set; }

    public int ActiveProjects { get; set; }

    public int TotalClients { get; set; }

    public int TotalAnnouncements { get; set; }

    public int PendingLeaves { get; set; }

    public int TodayAttendanceCount { get; set; }

    public int PresentToday { get; set; }

    public int WfoToday { get; set; }

    public int WfhToday { get; set; }

    public int AbsentToday { get; set; }
}
