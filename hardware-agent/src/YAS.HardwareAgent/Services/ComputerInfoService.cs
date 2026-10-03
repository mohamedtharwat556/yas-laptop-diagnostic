using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting computer information
/// Foundation implementation - returns null values for now
/// </summary>
public class ComputerInfoService : IComputerInfoService
{
    private readonly ILogger<ComputerInfoService> _logger;

    public ComputerInfoService(ILogger<ComputerInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<ComputerInfo> GetComputerInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting computer information");

        // Foundation: Return empty structure
        // Real implementation will use WMI to query Win32_ComputerSystem
        return await Task.FromResult(new ComputerInfo
        {
            Manufacturer = null,
            Model = null,
            DeviceType = null,
            SerialNumber = null
        });
    }
}
