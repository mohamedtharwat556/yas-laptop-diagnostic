using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting battery information
/// </summary>
public interface IBatteryInfoService
{
    Task<BatteryInfo> GetBatteryInfoAsync(CancellationToken cancellationToken = default);
}
