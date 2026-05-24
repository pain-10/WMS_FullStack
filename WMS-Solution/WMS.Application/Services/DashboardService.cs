using System.Linq;
using WMS.Application.DTOs.Dashboard;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IGenericRepository<Employee> _employeeRepo;
    private readonly IGenericRepository<Project> _projectRepo;
    private readonly IGenericRepository<Client> _clientRepo;
    private readonly IGenericRepository<Announcement> _announcementRepo;
    private readonly IGenericRepository<Leave> _leaveRepo;
    private readonly IGenericRepository<Attendance> _attendanceRepo;

    public DashboardService(
        IGenericRepository<Employee> employeeRepo,
        IGenericRepository<Project> projectRepo,
        IGenericRepository<Client> clientRepo,
        IGenericRepository<Announcement> announcementRepo,
        IGenericRepository<Leave> leaveRepo,
        IGenericRepository<Attendance> attendanceRepo)
    {
        _employeeRepo = employeeRepo;
        _projectRepo = projectRepo;
        _clientRepo = clientRepo;
        _announcementRepo = announcementRepo;
        _leaveRepo = leaveRepo;
        _attendanceRepo = attendanceRepo;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var employees = await _employeeRepo.GetAllAsync();
        var projects = await _projectRepo.GetAllAsync();
        var clients = await _clientRepo.GetAllAsync();
        var announcements = await _announcementRepo.GetAllAsync();
        var leaves = await _leaveRepo.GetAllAsync();
        var attendances = await _attendanceRepo.GetAllAsync();

        var today = DateTime.UtcNow.Date;

        var todayAttendance = attendances.Where(a => a.AttendanceDate.Date == today).ToList();
        var presentToday = todayAttendance.Count;
        var wfoToday = todayAttendance.Count(a => a.WorkMode == "WFO");
        var wfhToday = todayAttendance.Count(a => a.WorkMode == "WFH");

        return new DashboardDto
        {
            TotalEmployees = employees.Count(),
            ActiveEmployees = employees.Count(e => e.Status == "Active"),
            TotalProjects = projects.Count(),
            ActiveProjects = projects.Count(p => p.Status == "Active"),
            TotalClients = clients.Count(),
            TotalAnnouncements = announcements.Count(),
            PendingLeaves = leaves.Count(l => l.Status == "Pending"),
            TodayAttendanceCount = todayAttendance.Count,
            PresentToday = presentToday,
            WfoToday = wfoToday,
            WfhToday = wfhToday,
            AbsentToday = Math.Max(0, employees.Count(e => e.Status == "Active") - presentToday)
        };
    }
}
