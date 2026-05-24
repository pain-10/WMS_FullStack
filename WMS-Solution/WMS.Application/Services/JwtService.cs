using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WMS.Application.Interfaces;

namespace WMS.Application.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(
        int employeeId,
        string username,
        string role)
    {
        var jwtSettings =
            _configuration.GetSection("Jwt");

        var key = Encoding.UTF8.GetBytes(
            jwtSettings["Key"]!);

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                employeeId.ToString()),

            new Claim(
                ClaimTypes.Name,
                username),

            new Claim(
                ClaimTypes.Role,
                role)
        };

        var credentials =
            new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(
                    jwtSettings["DurationInMinutes"])),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}