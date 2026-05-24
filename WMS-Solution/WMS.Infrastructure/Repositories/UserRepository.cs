using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Context;

namespace WMS.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly WmsDbContext _context;

    public UserRepository(
        WmsDbContext context)
    {
        _context = context;
    }

    public async Task<UserLogin?> GetByUsernameAsync(
        string username)
    {
        return await _context.UserLogins
            .FirstOrDefaultAsync(
                u => u.Username == username);
    }

    public async Task AddUserAsync(
        UserLogin user)
    {
        await _context.UserLogins.AddAsync(user);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}