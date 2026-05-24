using System.Net;
using System.Text.Json;

namespace WMS.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var code = HttpStatusCode.InternalServerError;
        if (ex is UnauthorizedAccessException) code = HttpStatusCode.Unauthorized;
        else if (ex is System.ComponentModel.DataAnnotations.ValidationException) code = HttpStatusCode.BadRequest;
        else if (ex is KeyNotFoundException) code = HttpStatusCode.NotFound;

        var result = JsonSerializer.Serialize(new
        {
            success = false,
            message = ex.Message,
            statusCode = (int)code
        });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;
        return context.Response.WriteAsync(result);
    }
}
