using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting GPU information
/// Foundation implementation - returns empty list for now
/// </summary>
public class GpuInfoService : IGpuInfoService
{
    private readonly ILogger<GpuInfoService> _logger;

    public GpuInfoService(ILogger<GpuInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<List<GpuInfo>> GetGpuInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting GPU information");

        // Foundation: Return empty list
        // Real implementation will use WMI to query Win32_VideoController
        return await Task.FromResult(new List<GpuInfo>());
    }
}
