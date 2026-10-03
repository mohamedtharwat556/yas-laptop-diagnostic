using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting battery information
/// Foundation implementation - returns null values for now
/// </summary>
public class BatteryInfoService : IBatteryInfoService
{
    private readonly ILogger<BatteryInfoService> _logger;

    public BatteryInfoService(ILogger<BatteryInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<BatteryInfo> GetBatteryInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting battery information");

        // Foundation: Return empty structure
        // Real implementation will use WMI to query Win32_Battery
        return await Task.FromResult(new BatteryInfo
        {
            Present = null,
            Percentage = null,
            Charging = null,
            DesignCapacityWh = null,
            FullChargeCapacityWh = null,
            CycleCount = null
        });
    }
}
