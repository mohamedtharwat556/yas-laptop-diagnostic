using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real CPU information from Windows WMI
/// Uses Win32_Processor to query actual hardware data
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
        _logger.LogDebug("Collecting CPU information from Win32_Processor WMI");

        try
        {
            // Query Win32_Processor WMI class
            var cpuQuery = "SELECT Name, Manufacturer, Description, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed, CurrentClockSpeed, Architecture, ProcessorId, SocketDesignation, L2CacheSize, L3CacheSize FROM Win32_Processor";
            
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery(cpuQuery);
            var searcher = new ManagementObjectSearcher(scope, query);

            CpuInfo cpuInfo = new();

            // Get first CPU (most systems have 1 logical CPU entry in Win32_Processor)
            foreach (ManagementObject mo in searcher.Get())
            {
                try
                {
                    cpuInfo.Name = mo["Name"]?.ToString();
                    cpuInfo.Manufacturer = mo["Manufacturer"]?.ToString();
                    cpuInfo.Description = mo["Description"]?.ToString();
                    
                    // Parse cores
                    if (int.TryParse(mo["NumberOfCores"]?.ToString(), out int cores))
                    {
                        cpuInfo.Cores = cores;
                    }

                    // Parse logical processors
                    if (int.TryParse(mo["NumberOfLogicalProcessors"]?.ToString(), out int logicalProcs))
                    {
                        cpuInfo.LogicalProcessors = logicalProcs;
                    }

                    // Parse max clock speed (in MHz)
                    if (int.TryParse(mo["MaxClockSpeed"]?.ToString(), out int maxClock))
                    {
                        cpuInfo.MaxClockMHz = maxClock;
                    }

                    // Parse current clock speed (in MHz)
                    if (int.TryParse(mo["CurrentClockSpeed"]?.ToString(), out int currentClock))
                    {
                        cpuInfo.CurrentClockMHz = currentClock;
                    }

                    cpuInfo.Architecture = mo["Architecture"]?.ToString();
                    cpuInfo.ProcessorId = mo["ProcessorId"]?.ToString();
                    cpuInfo.SocketDesignation = mo["SocketDesignation"]?.ToString();

                    // Parse L2 cache size (in KB)
                    if (int.TryParse(mo["L2CacheSize"]?.ToString(), out int l2Cache))
                    {
                        cpuInfo.L2CacheSizeKB = l2Cache;
                    }

                    // Parse L3 cache size (in KB)
                    if (int.TryParse(mo["L3CacheSize"]?.ToString(), out int l3Cache))
                    {
                        cpuInfo.L3CacheSizeKB = l3Cache;
                    }

                    _logger.LogInformation("CPU collected: {Name}", cpuInfo.Name);
                    break; // Use first CPU entry
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing CPU information from WMI");
                }
            }

            // Return result even if some fields are null
            return await Task.FromResult(cpuInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting CPU information");
            // Return empty structure instead of throwing
            return await Task.FromResult(new CpuInfo());
        }
    }
}
