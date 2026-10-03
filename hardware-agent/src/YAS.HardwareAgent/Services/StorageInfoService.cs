using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting storage information
/// Foundation implementation - returns empty list for now
/// </summary>
public class StorageInfoService : IStorageInfoService
{
    private readonly ILogger<StorageInfoService> _logger;

    public StorageInfoService(ILogger<StorageInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<List<StorageInfo>> GetStorageInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting storage information");

        // Foundation: Return empty list
        // Real implementation will use WMI to query Win32_DiskDrive and Win32_LogicalDisk
        return await Task.FromResult(new List<StorageInfo>());
    }
}
