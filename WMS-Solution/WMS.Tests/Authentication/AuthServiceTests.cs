using System.ComponentModel.DataAnnotations;
using Moq;
using FluentAssertions;
using WMS.Application.DTOs.Auth;
using WMS.Application.Interfaces;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Tests.Authentication;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IGenericRepository<Employee>> _employeeRepoMock;
    private readonly Mock<IGenericRepository<Role>> _roleRepoMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _employeeRepoMock = new Mock<IGenericRepository<Employee>>();
        _roleRepoMock = new Mock<IGenericRepository<Role>>();
        _jwtServiceMock = new Mock<IJwtService>();

        _sut = new AuthService(
            _userRepoMock.Object,
            _employeeRepoMock.Object,
            _roleRepoMock.Object,
            _jwtServiceMock.Object);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnToken()
    {
        var username = "admin";
        var password = "password";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = new UserLogin
        {
            UserId = 1,
            Username = username,
            PasswordHash = passwordHash,
            EmployeeId = 1,
            RoleId = 1
        };
        var role = new Role { RoleId = 1, RoleName = "Admin" };

        _userRepoMock.Setup(x => x.GetByUsernameAsync(username)).ReturnsAsync(user);
        _roleRepoMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(role);
        _jwtServiceMock.Setup(x => x.GenerateToken(1, username, "Admin")).Returns("test-token");

        var request = new LoginRequestDto { Username = username, Password = password };

        var result = await _sut.LoginAsync(request);

        result.Should().NotBeNull();
        result.Token.Should().Be("test-token");
        result.Username.Should().Be(username);
        result.Role.Should().Be("Admin");
        result.EmployeeId.Should().Be(1);
        _userRepoMock.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ThrowUnauthorizedAccessException()
    {
        var username = "admin";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("correct-password");
        var user = new UserLogin
        {
            UserId = 1,
            Username = username,
            PasswordHash = passwordHash,
            EmployeeId = 1,
            RoleId = 1
        };

        _userRepoMock.Setup(x => x.GetByUsernameAsync(username)).ReturnsAsync(user);

        var request = new LoginRequestDto { Username = username, Password = "wrong-password" };

        await FluentActions.Awaiting(() => _sut.LoginAsync(request))
            .Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid username/password");
    }

    [Fact]
    public async Task Login_NullUsername_ThrowUnauthorizedAccessException()
    {
        _userRepoMock.Setup(x => x.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync((UserLogin?)null);

        var request = new LoginRequestDto { Username = "nonexistent", Password = "password" };

        await FluentActions.Awaiting(() => _sut.LoginAsync(request))
            .Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid username/password");
    }

    [Fact]
    public void GenerateJwt_ReturnNotNull()
    {
        var jwtSettings = new Dictionary<string, string?>
        {
            ["Key"] = "this-is-a-super-secret-key-for-testing-12345678",
            ["Issuer"] = "TestIssuer",
            ["Audience"] = "TestAudience",
            ["DurationInMinutes"] = "60"
        };

        var jwtSectionMock = new Mock<Microsoft.Extensions.Configuration.IConfigurationSection>();
        jwtSectionMock.Setup(x => x.Key).Returns("Jwt");
        jwtSectionMock.Setup(x => x.Path).Returns("Jwt");
        jwtSectionMock.Setup(x => x.Value).Returns((string?)null);
        jwtSectionMock.Setup(x => x[It.IsAny<string>()]).Returns<string>(key => jwtSettings.GetValueOrDefault(key));

        var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
        configMock.Setup(x => x.GetSection("Jwt")).Returns(jwtSectionMock.Object);

        var jwtService = new JwtService(configMock.Object);

        var token = jwtService.GenerateToken(1, "testuser", "Admin");

        token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_ValidData_ReturnAuthResponse()
    {
        _userRepoMock.Setup(x => x.GetByUsernameAsync("newuser")).ReturnsAsync((UserLogin?)null);
        _employeeRepoMock.Setup(x => x.AddAsync(It.IsAny<Employee>())).Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _userRepoMock.Setup(x => x.AddUserAsync(It.IsAny<UserLogin>())).Returns(Task.CompletedTask);
        _userRepoMock.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);
        _roleRepoMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(new Role { RoleId = 2, RoleName = "Employee" });
        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<int>(), "newuser", "Employee")).Returns("test-token");

        var request = new RegisterRequestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com",
            PhoneNumber = "1234567890",
            Gender = 'M',
            DOB = new DateTime(1990, 1, 1),
            DOJ = new DateTime(2024, 1, 1),
            Username = "newuser",
            Password = "password123",
            DepartmentId = 1,
            RoleId = 2
        };

        var result = await _sut.RegisterAsync(request);

        result.Should().NotBeNull();
        result.Token.Should().Be("test-token");
        result.Username.Should().Be("newuser");
        result.Role.Should().Be("Employee");
        _employeeRepoMock.Verify(x => x.AddAsync(It.IsAny<Employee>()), Times.Once);
        _userRepoMock.Verify(x => x.AddUserAsync(It.IsAny<UserLogin>()), Times.Once);
    }

    [Fact]
    public async Task Register_DuplicateUsername_ThrowValidationException()
    {
        _userRepoMock.Setup(x => x.GetByUsernameAsync("existing")).ReturnsAsync(new UserLogin());

        var request = new RegisterRequestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com",
            PhoneNumber = "1234567890",
            Gender = 'M',
            DOB = new DateTime(1990, 1, 1),
            DOJ = new DateTime(2024, 1, 1),
            Username = "existing",
            Password = "password123",
            DepartmentId = 1,
            RoleId = 2
        };

        await FluentActions.Awaiting(() => _sut.RegisterAsync(request))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("Username already exists");
    }
}
