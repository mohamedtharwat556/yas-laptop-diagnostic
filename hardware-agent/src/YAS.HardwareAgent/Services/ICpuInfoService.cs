using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting CPU information
/// </summary>
public interface ICpuInfoService
{
    Task<CpuInfo> GetCpuInfoAsync(CancellationToken cancellationToken = default);
}
