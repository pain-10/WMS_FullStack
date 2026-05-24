using WMS.Application.DTOs.Client;

namespace WMS.Application.Interfaces;

public interface IClientService
{
    Task<ClientDto> CreateAsync(CreateClientDto dto);

    Task<List<ClientDto>> GetAllAsync();

    Task<ClientDto?> GetByIdAsync(int id);

    Task<ClientDto> UpdateAsync(int id, CreateClientDto dto);

    Task<bool> DeleteAsync(int id);
}
