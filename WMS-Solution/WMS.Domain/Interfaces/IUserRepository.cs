using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IUserRepository
{
    Task<UserLogin?> GetByUsernameAsync(
        string username);

    Task AddUserAsync(
        UserLogin user);

    Task SaveChangesAsync();
}