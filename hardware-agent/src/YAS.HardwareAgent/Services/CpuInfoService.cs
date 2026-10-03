using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting CPU information
/// Foundation implementation - returns null values for now
/// </summary>
public class CpuInfoService : ICpuInfoService
{
    private readonly ILogger<CpuInfoService> _logger;

    public CpuInfoService(ILogger<CpuInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<CpuInfo> GetCpuInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting CPU information");

        // Foundation: Return empty structure
        // Real implementation will use WMI to query Win32_Processor
        return await Task.FromResult(new CpuInfo
        {
            Name = null,
            Manufacturer = null,
            Cores = null,
            LogicalProcessors = null,
            MaxClockMHz = null
        });
    }
}
