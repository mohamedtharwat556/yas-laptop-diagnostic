using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting operating system information
/// Foundation implementation - returns null values for now
/// </summary>
public class OperatingSystemInfoService : IOperatingSystemInfoService
{
    private readonly ILogger<OperatingSystemInfoService> _logger;

    public OperatingSystemInfoService(ILogger<OperatingSystemInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<OperatingSystemInfo> GetOperatingSystemInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting operating system information");

        // Foundation: Return empty structure
        // Real implementation will use WMI to query Win32_OperatingSystem
        return await Task.FromResult(new OperatingSystemInfo
        {
            Name = null,
            Version = null,
            Build = null
        });
    }
}
