using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting GPU information
/// </summary>
public interface IGpuInfoService
{
    Task<List<GpuInfo>> GetGpuInfoAsync(CancellationToken cancellationToken = default);
}
