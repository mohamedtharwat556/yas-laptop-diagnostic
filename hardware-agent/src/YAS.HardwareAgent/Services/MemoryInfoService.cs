using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting memory information
/// Foundation implementation - returns null values for now
/// </summary>
public class MemoryInfoService : IMemoryInfoService
{
    private readonly ILogger<MemoryInfoService> _logger;

    public MemoryInfoService(ILogger<MemoryInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<MemoryInfo> GetMemoryInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting memory information");

        // Foundation: Return empty structure
        // Real implementation will use WMI to query Win32_PhysicalMemory
        return await Task.FromResult(new MemoryInfo
        {
            TotalBytes = null,
            TotalGB = null,
            Modules = new List<MemoryModule>()
        });
    }
}
