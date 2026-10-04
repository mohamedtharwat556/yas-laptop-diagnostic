using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real storage information from Windows WMI
/// Uses Win32_DiskDrive for physical disks and Win32_LogicalDisk for volumes
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
        _logger.LogDebug("Collecting storage information from Win32_DiskDrive and Win32_LogicalDisk");

        var storageList = new List<StorageInfo>();

        try
        {
            // First, get physical disks
            var diskQuery = "SELECT Model, Manufacturer, MediaType, SerialNumber, Size, Status, Name, InterfaceType FROM Win32_DiskDrive";
            
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery(diskQuery);
            var searcher = new ManagementObjectSearcher(scope, query);

            // Dictionary to store disk info by device ID
            var diskInfoDict = new Dictionary<string, StorageInfo>();

            foreach (ManagementObject diskDrive in searcher.Get())
            {
                try
                {
                    var storage = new StorageInfo();

                    storage.Model = diskDrive["Model"]?.ToString();
                    storage.Manufacturer = diskDrive["Manufacturer"]?.ToString();
                    storage.SerialNumber = diskDrive["SerialNumber"]?.ToString();
                    storage.DeviceID = diskDrive["Name"]?.ToString(); // e.g., \\.\PHYSICALDRIVE0
                    storage.Status = diskDrive["Status"]?.ToString();
                    storage.Interface = diskDrive["InterfaceType"]?.ToString();

                    // Parse media type
                    string? mediaType = diskDrive["MediaType"]?.ToString();
                    storage.MediaType = mediaType;
                    storage.Type = DetermineStorageType(mediaType);

                    // Parse capacity (in bytes)
                    if (long.TryParse(diskDrive["Size"]?.ToString(), out long sizeBytes))
                    {
                        storage.CapacityGB = Math.Round(sizeBytes / (1024.0 * 1024.0 * 1024.0), 2);
                    }

                    // Store for later matching with logical disks
                    string? deviceId = diskDrive["Name"]?.ToString();
                    if (!string.IsNullOrEmpty(deviceId))
                    {
                        diskInfoDict[deviceId] = storage;
                    }

                    _logger.LogInformation("Physical disk collected: {Model} - {CapacityGB}GB", storage.Model, storage.CapacityGB);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing physical disk information");
                }
            }

            // Now get logical disks and match them with physical disks
            var logicalDiskQuery = "SELECT Name, Size, FreeSpace, Status FROM Win32_LogicalDisk WHERE DriveType = 3"; // Type 3 = Local Disk
            query = new ObjectQuery(logicalDiskQuery);
            searcher = new ManagementObjectSearcher(scope, query);

            var logicalDisks = new Dictionary<string, (long Size, long FreeSpace)>();

            foreach (ManagementObject logicalDisk in searcher.Get())
            {
                try
                {
                    string? driveLetter = logicalDisk["Name"]?.ToString();
                    if (string.IsNullOrEmpty(driveLetter))
                        continue;

                    if (long.TryParse(logicalDisk["Size"]?.ToString(), out long totalSize) &&
                        long.TryParse(logicalDisk["FreeSpace"]?.ToString(), out long freeSpace))
                    {
                        logicalDisks[driveLetter] = (totalSize, freeSpace);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing logical disk information");
                }
            }

            // If we have logical disks but no physical disks (shouldn't happen), create storage entries from logical disks
            if (diskInfoDict.Count == 0 && logicalDisks.Count > 0)
            {
                _logger.LogWarning("No physical disks found, using logical disk information");

                foreach (var kvp in logicalDisks)
                {
                    string driveLetter = kvp.Key;
                    var (totalSize, freeSpace) = kvp.Value;

                    var storage = new StorageInfo
                    {
                        DriveLetter = driveLetter,
                        Type = "Unknown",
                        Limitation = "Physical disk information not available via WMI"
                    };

                    if (totalSize > 0)
                    {
                        storage.CapacityGB = Math.Round(totalSize / (1024.0 * 1024.0 * 1024.0), 2);
                    }

                    double usedBytes = totalSize - freeSpace;
                    storage.UsedGB = Math.Round(usedBytes / (1024.0 * 1024.0 * 1024.0), 2);
                    storage.FreeGB = Math.Round(freeSpace / (1024.0 * 1024.0 * 1024.0), 2);

                    if (totalSize > 0)
                    {
                        storage.UsagePercent = Math.Round((usedBytes / (double)totalSize) * 100, 2);
                    }

                    storageList.Add(storage);
                }
            }
            else if (diskInfoDict.Count > 0)
            {
                // For each physical disk, try to find associated logical disks
                // In a simple case, we'll add all disks we found
                foreach (var storage in diskInfoDict.Values)
                {
                    // If we have logical disk info, try to populate it
                    // For now, just add the physical disk info
                    storageList.Add(storage);
                }

                // Also add logical disk volume info
                foreach (var kvp in logicalDisks)
                {
                    string driveLetter = kvp.Key;
                    var (totalSize, freeSpace) = kvp.Value;

                    var volumeStorage = new StorageInfo
                    {
                        DriveLetter = driveLetter,
                        Type = "Volume"
                    };

                    if (totalSize > 0)
                    {
                        volumeStorage.CapacityGB = Math.Round(totalSize / (1024.0 * 1024.0 * 1024.0), 2);
                    }

                    double usedBytes = totalSize - freeSpace;
                    volumeStorage.UsedGB = Math.Round(usedBytes / (1024.0 * 1024.0 * 1024.0), 2);
                    volumeStorage.FreeGB = Math.Round(freeSpace / (1024.0 * 1024.0 * 1024.0), 2);

                    if (totalSize > 0)
                    {
                        volumeStorage.UsagePercent = Math.Round((usedBytes / (double)totalSize) * 100, 2);
                    }

                    storageList.Add(volumeStorage);
                }
            }

            if (storageList.Count == 0)
            {
                _logger.LogWarning("No storage devices found");
            }

            return await Task.FromResult(storageList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting storage information");
            return await Task.FromResult(new List<StorageInfo>());
        }
    }

    /// <summary>
    /// Determine storage type (SSD, HDD, NVMe) from media type
    /// </summary>
    private string DetermineStorageType(string? mediaType)
    {
        if (string.IsNullOrEmpty(mediaType))
            return "Unknown";

        mediaType = mediaType.ToLower();

        // Only make claims when we have real evidence
        if (mediaType.Contains("ssd"))
            return "SSD";
        if (mediaType.Contains("fixed"))
            return "HDD"; // Most "Fixed" media are HDD
        if (mediaType.Contains("removable"))
            return "Removable";

        return "Unknown";
    }
}
