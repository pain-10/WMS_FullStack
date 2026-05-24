using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using WMS.Infrastructure.Context;
using WMS.Application.Interfaces;
using WMS.Application.Services;
using WMS.Domain.Interfaces;
using WMS.Domain.Entities;
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
builder.Services.AddScoped<
    IUserRepository,
    UserRepository>();

builder.Services.AddScoped(
    typeof(IGenericRepository<>),
    typeof(GenericRepository<>));


// Register services
builder.Services.AddScoped<
    IAuthService,
    AuthService>();

builder.Services.AddScoped<
    IJwtService,
    JwtService>();

builder.Services.AddScoped<
    IEmployeeService,
    EmployeeService>();

builder.Services.AddScoped<
    IAttendanceService,
    AttendanceService>();

builder.Services.AddScoped<
    ILeaveService,
    LeaveService>();

builder.Services.AddScoped<
    IAnnouncementService,
    AnnouncementService>();

builder.Services.AddScoped<
    IClientService,
    ClientService>();

builder.Services.AddScoped<
    IProjectService,
    ProjectService>();

builder.Services.AddScoped<
    IAllocationService,
    AllocationService>();

builder.Services.AddScoped<
    IAuditService,
    AuditService>();

builder.Services.AddScoped<
    IDashboardService,
    DashboardService>();

builder.Services.AddScoped<
    IDepartmentService,
    DepartmentService>();

builder.Services.AddScoped<
    INotificationService,
    NotificationService>();

builder.Services.AddScoped<
    IReportService,
    ReportService>();


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
                    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
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
                if (allowedFrontendOrigins.Length > 0)
                {
                    policy.WithOrigins(
                        allowedFrontendOrigins);
                }
                else
                {
                    throw new InvalidOperationException(
                        "Frontend:AllowedOrigins must contain at least one origin.");
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
                new SymmetricSecurityKey(
                    key)
        };
});



// Swagger + JWT
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WMS API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


var app = builder.Build();


// Seed development data
if (app.Environment.IsDevelopment())
{
    await SeedDevelopmentUsersAsync(
        app.Services);

    await SeedData
        .SeedDevelopmentDataAsync(
            app.Services);
}



// Global exception middleware
app.UseMiddleware<
    ExceptionMiddleware>();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}


if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}


// CORS before auth
app.UseCors(
    "FrontendCorsPolicy");


// Authentication
app.UseAuthentication();


// Audit middleware
app.UseMiddleware<
    AuditMiddleware>();


// Authorization
app.UseAuthorization();


// Map controllers
app.MapControllers();

app.Run();



// =======================
// Seed Users
// =======================

static async Task SeedDevelopmentUsersAsync(
    IServiceProvider services)
{
    using var scope =
        services.CreateScope();

    var db =
        scope.ServiceProvider
            .GetRequiredService<WmsDbContext>();


    if (!await db.Roles.AnyAsync())
    {
        db.Roles.AddRange(

            new Role
            {
                RoleName = "Admin"
            },

            new Role
            {
                RoleName = "Manager"
            },

            new Role
            {
                RoleName = "Employee"
            });

        await db.SaveChangesAsync();
    }


    if (!await db.Departments.AnyAsync())
    {
        db.Departments.AddRange(

            new Department
            {
                DepartmentName = "HR",
                CreatedOn = DateTime.UtcNow
            },

            new Department
            {
                DepartmentName = "IT",
                CreatedOn = DateTime.UtcNow
            },

            new Department
            {
                DepartmentName = "Finance",
                CreatedOn = DateTime.UtcNow
            });

        await db.SaveChangesAsync();
    }


    var roles =
        await db.Roles
        .ToDictionaryAsync(
            r => r.RoleName);

    var departmentId =
        await db.Departments
        .OrderBy(
            d => d.DepartmentId)
        .Select(
            d => d.DepartmentId)
        .FirstAsync();


    await EnsureDemoUserAsync(
        db,
        "admin",
        roles["Admin"].RoleId,
        departmentId,
        "Admin",
        "User",
        "admin@wms.local");


    await EnsureDemoUserAsync(
        db,
        "manager",
        roles["Manager"].RoleId,
        departmentId,
        "Manager",
        "User",
        "manager@wms.local");


    await EnsureDemoUserAsync(
        db,
        "employee",
        roles["Employee"].RoleId,
        departmentId,
        "Employee",
        "User",
        "employee@wms.local");
}



static async Task EnsureDemoUserAsync(
WmsDbContext db,
string username,
int roleId,
int departmentId,
string firstName,
string lastName,
string email)
{
    var user =
        await db.UserLogins
        .FirstOrDefaultAsync(
            u => u.Username == username);

    if (user != null)
    {
        if (!BCrypt.Net.BCrypt.Verify(
            "password",
            user.PasswordHash))
        {
            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    "password");
        }

        user.RoleId = roleId;

        await db.SaveChangesAsync();

        return;
    }

    var employee =
        await db.Employees
        .FirstOrDefaultAsync(
            e => e.Email == email);

    if (employee == null)
    {
        employee = new Employee
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = "9999999999",
            Gender = 'O',
            DOB = DateTime.UtcNow.AddYears(-25),
            DOJ = DateTime.UtcNow.Date,
            DepartmentId = departmentId,
            RoleId = roleId,
            Status = "Active",
            CreatedOn = DateTime.UtcNow
        };

        db.Employees.Add(
            employee);

        await db.SaveChangesAsync();
    }

    db.UserLogins.Add(
        new UserLogin
        {
            Username = username,
            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    "password"),

            EmployeeId =
                employee.EmployeeId,

            RoleId = roleId
        });

    await db.SaveChangesAsync();
}