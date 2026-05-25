using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using WMS.Infrastructure.Context;
using WMS.Application.Interfaces;
using WMS.Application.Services;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Repositories;
using WMS.API.Middleware;
using WMS.API;

var builder = WebApplication.CreateBuilder(args);


// Register DbContext
builder.Services.AddDbContext<WmsDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection")));


// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped(
    typeof(IGenericRepository<>),
    typeof(GenericRepository<>));


// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IAllocationService, AllocationService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IReportService, ReportService>();


// Controllers
builder.Services.AddControllers();


// CORS Configuration
var allowedFrontendOrigins =
    builder.Configuration
        .GetSection("Frontend:AllowedOrigins")
        .Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "FrontendCorsPolicy",
        policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                policy.SetIsOriginAllowed(origin =>
                {
                    if (!Uri.TryCreate(
                        origin,
                        UriKind.Absolute,
                        out var uri))
                        return false;

                    return uri.Host.Equals(
                               "localhost",
                               StringComparison.OrdinalIgnoreCase)
                           ||
                           uri.Host.Equals(
                               "127.0.0.1",
                               StringComparison.OrdinalIgnoreCase);
                });
            }
            else
            {
                // Azure deployment fix
                if (allowedFrontendOrigins.Length > 0)
                {
                    policy.WithOrigins(
                        allowedFrontendOrigins);
                }
                else
                {
                    // Temporary for deployment
                    policy.AllowAnyOrigin();
                }
            }

            policy
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});



// JWT Configuration
var jwtSettings =
    builder.Configuration.GetSection("Jwt");

var key = Encoding.UTF8.GetBytes(
    jwtSettings["Key"]!);

builder.Services
.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer =
                jwtSettings["Issuer"],

            ValidAudience =
                jwtSettings["Audience"],

            IssuerSigningKey =
                new SymmetricSecurityKey(key)
        };
});



// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "WMS API",
            Version = "v1"
        });

    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Description =
                "JWT Authorization header using Bearer",

            Name = "Authorization",

            In = ParameterLocation.Header,

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT"
        });

    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});


var app = builder.Build();


// Apply pending migrations and seed data (non-fatal on failure — app starts regardless)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<WmsDbContext>();
        await db.Database.MigrateAsync();
    }

    await SeedData.SeedDevelopmentDataAsync(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Database migration/seed failed. App started — check connection string, firewall, and database existence.");
}


// Global exception middleware
app.UseMiddleware<ExceptionMiddleware>();


// Enable Swagger in Azure also
app.UseSwagger();

app.UseSwaggerUI();


// HTTPS
app.UseHttpsRedirection();


// CORS
app.UseCors(
    "FrontendCorsPolicy");


// Authentication
app.UseAuthentication();


// Audit Middleware
app.UseMiddleware<
    AuditMiddleware>();


// Authorization
app.UseAuthorization();


// Controllers
app.MapControllers();

app.Run();