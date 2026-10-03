using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting network information
/// Foundation implementation - returns empty list for now
/// </summary>
public class NetworkInfoService : INetworkInfoService
{
    private readonly ILogger<NetworkInfoService> _logger;

    public NetworkInfoService(ILogger<NetworkInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<List<NetworkInfo>> GetNetworkInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting network information");

        // Foundation: Return empty list
        // Real implementation will use WMI to query Win32_NetworkAdapter
        return await Task.FromResult(new List<NetworkInfo>());
    }
}
