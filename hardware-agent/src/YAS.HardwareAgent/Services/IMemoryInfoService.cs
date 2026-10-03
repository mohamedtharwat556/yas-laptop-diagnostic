using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting memory information
/// </summary>
public interface IMemoryInfoService
{
    Task<MemoryInfo> GetMemoryInfoAsync(CancellationToken cancellationToken = default);
}
