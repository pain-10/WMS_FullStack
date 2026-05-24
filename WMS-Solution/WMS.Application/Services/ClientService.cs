using System.Linq;
using WMS.Application.DTOs.Client;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class ClientService : IClientService
{
    private readonly IGenericRepository<Client> _clientRepository;

    public ClientService(IGenericRepository<Client> clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<ClientDto> CreateAsync(CreateClientDto dto)
    {
        var client = new Client
        {
            ClientName = dto.ClientName,
            ClientAddress = dto.ClientAddress,
            ClientPhoneNumber = dto.ClientPhoneNumber,
            ClientLocation = dto.ClientLocation,
            Status = dto.Status
        };

        await _clientRepository.AddAsync(client);
        await _clientRepository.SaveChangesAsync();

        return MapToDto(client);
    }

    public async Task<List<ClientDto>> GetAllAsync()
    {
        var clients = await _clientRepository.GetAllAsync();
        return clients.Select(MapToDto).ToList();
    }

    public async Task<ClientDto?> GetByIdAsync(int id)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        if (client == null) return null;
        return MapToDto(client);
    }

    public async Task<ClientDto> UpdateAsync(int id, CreateClientDto dto)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        if (client == null) throw new KeyNotFoundException("Client not found");

        client.ClientName = dto.ClientName;
        client.ClientAddress = dto.ClientAddress;
        client.ClientPhoneNumber = dto.ClientPhoneNumber;
        client.ClientLocation = dto.ClientLocation;
        client.Status = dto.Status;

        _clientRepository.Update(client);
        await _clientRepository.SaveChangesAsync();

        return MapToDto(client);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        if (client == null) return false;

        _clientRepository.Delete(client);
        await _clientRepository.SaveChangesAsync();
        return true;
    }

    private ClientDto MapToDto(Client c) => new ClientDto
    {
        ClientId = c.ClientId,
        ClientName = c.ClientName,
        ClientAddress = c.ClientAddress,
        ClientPhoneNumber = c.ClientPhoneNumber,
        ClientLocation = c.ClientLocation,
        Status = c.Status
    };
}
