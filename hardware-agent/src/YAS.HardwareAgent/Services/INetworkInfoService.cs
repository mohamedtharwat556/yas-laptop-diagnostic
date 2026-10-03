using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting network information
/// </summary>
public interface INetworkInfoService
{
    Task<List<NetworkInfo>> GetNetworkInfoAsync(CancellationToken cancellationToken = default);
}
