using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting operating system information
/// </summary>
public interface IOperatingSystemInfoService
{
    Task<OperatingSystemInfo> GetOperatingSystemInfoAsync(CancellationToken cancellationToken = default);
}
