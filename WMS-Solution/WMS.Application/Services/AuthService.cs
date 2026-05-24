using System.ComponentModel.DataAnnotations;
using WMS.Application.DTOs.Auth;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IGenericRepository<Employee> _employeeRepository;
    private readonly IGenericRepository<Role> _roleRepository;
    private readonly IJwtService _jwtService;

    public AuthService(
        IUserRepository userRepository,
        IGenericRepository<Employee> employeeRepository,
        IGenericRepository<Role> roleRepository,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _employeeRepository = employeeRepository;
        _roleRepository = roleRepository;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(
        RegisterRequestDto request)
    {
        // Check existing username
        var existingUser =
            await _userRepository.GetByUsernameAsync(
                request.Username);

        if (existingUser != null)
        {
            throw new ValidationException(
                "Username already exists");
        }

        // Create Employee
        var employee = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Gender = request.Gender,
            DOB = request.DOB,
            DOJ = request.DOJ,
            DepartmentId = request.DepartmentId,
            RoleId = request.RoleId
        };

        await _employeeRepository.AddAsync(employee);
        await _employeeRepository.SaveChangesAsync();

        // Create Login
        var user = new UserLogin
        {
            Username = request.Username,

            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password),

            EmployeeId = employee.EmployeeId,

            RoleId = request.RoleId
        };

        await _userRepository.AddUserAsync(user);
        await _userRepository.SaveChangesAsync();

        var role =
            await _roleRepository.GetByIdAsync(
                request.RoleId);

        // Generate JWT
        var token =
            _jwtService.GenerateToken(
                employee.EmployeeId,
                user.Username,
                role?.RoleName ?? "Employee");

        return new AuthResponseDto
        {
            EmployeeId = employee.EmployeeId,
            Username = user.Username,
            Role = role?.RoleName ?? "",
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(2)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(
        LoginRequestDto request)
    {
        var user =
            await _userRepository.GetByUsernameAsync(
                request.Username);

        if (user == null)
        {
            throw new UnauthorizedAccessException(
                "Invalid username/password");
        }

        bool valid;

        try
        {
            valid =
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash);
        }
        catch
        {
            throw new UnauthorizedAccessException(
                "Invalid username/password");
        }

        if (!valid)
        {
            throw new UnauthorizedAccessException(
                "Invalid username/password");
        }

        user.LastLogin = DateTime.UtcNow;
        await _userRepository.SaveChangesAsync();

        var role =
            await _roleRepository.GetByIdAsync(
                user.RoleId);

        var token =
            _jwtService.GenerateToken(
                user.EmployeeId,
                user.Username,
                role?.RoleName ?? user.Role?.RoleName ?? "Employee");

        return new AuthResponseDto
        {
            EmployeeId = user.EmployeeId,
            Username = user.Username,
            Role = role?.RoleName ?? user.Role?.RoleName ?? "Employee",
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(2)
        };
    }
}