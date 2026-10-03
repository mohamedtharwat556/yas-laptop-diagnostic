using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting storage information
/// </summary>
public interface IStorageInfoService
{
    Task<List<StorageInfo>> GetStorageInfoAsync(CancellationToken cancellationToken = default);
}
