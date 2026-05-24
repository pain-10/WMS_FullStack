using WMS.Application.DTOs.Dashboard;

namespace WMS.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync();
}
