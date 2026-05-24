using System.Text.Json;
using WMS.Application.Interfaces;

namespace WMS.API.Middleware;

public class AuditMiddleware
{
    private readonly RequestDelegate _next;

    public AuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IAuditService auditService)
    {
        await _next(context);

        try
        {
            if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
            {
                var path = context.Request.Path.Value ?? string.Empty;
                var method = context.Request.Method;

                // determine action and entity
                string entity = "";
                string action = method;
                int recordId = 0;

                if (path.Contains("/api/auth/login")) {
                    entity = "Auth";
                    action = "Login";
                }
                else if (path.Contains("/api/employee")) entity = "Employee";
                else if (path.Contains("/api/attendance")) entity = "Attendance";
                else if (path.Contains("/api/leave")) entity = "Leave";
                else if (path.Contains("/api/project")) entity = "Project";
                else if (path.Contains("/api/announcement")) entity = "Announcement";
                else if (path.Contains("/api/client")) entity = "Client";
                else if (path.Contains("/api/allocation")) entity = "Allocation";

                // try extract id from route segments
                var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
                if (segments.Length > 2)
                {
                    int.TryParse(segments.Last(), out recordId);
                }

                var userId = 0;
                if (context.User.Identity != null && context.User.Identity.IsAuthenticated)
                {
                    var idClaim = context.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
                    if (idClaim != null) int.TryParse(idClaim.Value, out userId);
                }

                if (!string.IsNullOrEmpty(entity))
                {
                    await auditService.LogAsync(userId, entity, recordId, action, path);
                }
            }
        }
        catch
        {
            // swallow to not affect response
        }
    }
}
