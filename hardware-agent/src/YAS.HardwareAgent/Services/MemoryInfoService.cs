using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real memory information from Windows WMI
/// Uses Win32_ComputerSystem and Win32_PhysicalMemory
/// </summary>
public class MemoryInfoService : IMemoryInfoService
{
    private readonly ILogger<MemoryInfoService> _logger;

    public MemoryInfoService(ILogger<MemoryInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<MemoryInfo> GetMemoryInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting memory information from Win32_ComputerSystem and Win32_PhysicalMemory WMI");

        var memoryInfo = new MemoryInfo();

        try
        {
            // Get total physical memory from Win32_ComputerSystem
            var totalMemory = GetTotalMemory();
            if (totalMemory.HasValue && totalMemory.Value > 0)
            {
                memoryInfo.TotalBytes = totalMemory.Value;
                memoryInfo.TotalGB = Math.Round(totalMemory.Value / (1024.0 * 1024.0 * 1024.0), 2);
                _logger.LogInformation("Total memory: {TotalGB} GB", memoryInfo.TotalGB);
            }

            // Get available memory and calculate used memory
            var availableMemory = GetAvailableMemory();
            if (availableMemory.HasValue && availableMemory.Value >= 0)
            {
                memoryInfo.AvailableBytes = availableMemory.Value;
                memoryInfo.AvailableGB = Math.Round(availableMemory.Value / (1024.0 * 1024.0 * 1024.0), 2);

                // Calculate used memory
                if (memoryInfo.TotalBytes.HasValue && memoryInfo.TotalBytes.Value > 0)
                {
                    memoryInfo.UsedBytes = memoryInfo.TotalBytes.Value - availableMemory.Value;
                    memoryInfo.UsedGB = Math.Round(memoryInfo.UsedBytes.Value / (1024.0 * 1024.0 * 1024.0), 2);
                    memoryInfo.UsagePercent = Math.Round((memoryInfo.UsedBytes.Value / (double)memoryInfo.TotalBytes.Value) * 100, 2);
                }
            }

            // Get memory modules from Win32_PhysicalMemory
            var modules = GetMemoryModules();
            memoryInfo.Modules = modules;
            _logger.LogInformation("Found {ModuleCount} memory modules", modules.Count);

            return await Task.FromResult(memoryInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting memory information");
            // Return empty structure instead of throwing
            return await Task.FromResult(new MemoryInfo());
        }
    }

    /// <summary>
    /// Get total physical memory in bytes from Win32_ComputerSystem
    /// </summary>
    private long? GetTotalMemory()
    {
        try
        {
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem");
            var searcher = new ManagementObjectSearcher(scope, query);

            foreach (ManagementObject mo in searcher.Get())
            {
                if (long.TryParse(mo["TotalPhysicalMemory"]?.ToString(), out long totalMemory))
                {
                    return totalMemory;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting total memory from WMI");
        }

        return null;
    }

    /// <summary>
    /// Get available physical memory in bytes
    /// This requires querying Win32_OperatingSystem for FreePhysicalMemory (in KB)
    /// </summary>
    private long? GetAvailableMemory()
    {
        try
        {
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            // Win32_OperatingSystem returns FreePhysicalMemory in KB
            var query = new ObjectQuery("SELECT FreePhysicalMemory FROM Win32_OperatingSystem");
            var searcher = new ManagementObjectSearcher(scope, query);

            foreach (ManagementObject mo in searcher.Get())
            {
                if (long.TryParse(mo["FreePhysicalMemory"]?.ToString(), out long freeMemoryKB))
                {
                    // Convert KB to bytes
                    return freeMemoryKB * 1024;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available memory from WMI");
        }

        return null;
    }

    /// <summary>
    /// Get all physical memory modules from Win32_PhysicalMemory
    /// </summary>
    private List<MemoryModule> GetMemoryModules()
    {
        var modules = new List<MemoryModule>();

        try
        {
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery("SELECT Manufacturer, PartNumber, SerialNumber, Capacity, Speed, ConfiguredClockSpeed, MemoryType, FormFactor, DeviceLocator, BankLabel FROM Win32_PhysicalMemory");
            var searcher = new ManagementObjectSearcher(scope, query);

            foreach (ManagementObject mo in searcher.Get())
            {
                try
                {
                    var module = new MemoryModule();

                    module.Manufacturer = mo["Manufacturer"]?.ToString();
                    module.PartNumber = mo["PartNumber"]?.ToString();
                    module.SerialNumber = mo["SerialNumber"]?.ToString();

                    // Parse capacity (in bytes)
                    if (long.TryParse(mo["Capacity"]?.ToString(), out long capacityBytes))
                    {
                        module.CapacityBytes = capacityBytes;
                        module.CapacityGB = Math.Round(capacityBytes / (1024.0 * 1024.0 * 1024.0), 2);
                    }

                    // Parse speed (MHz)
                    if (int.TryParse(mo["Speed"]?.ToString(), out int speedMHz))
                    {
                        module.SpeedMHz = speedMHz;
                    }

                    // Parse configured clock speed (MHz)
                    if (int.TryParse(mo["ConfiguredClockSpeed"]?.ToString(), out int configuredSpeed))
                    {
                        module.ConfiguredClockSpeedMHz = configuredSpeed;
                    }

                    // Parse memory type (0=Unknown, 1=Other, 2=DRAM, 3=Synchronous DRAM, etc.)
                    if (int.TryParse(mo["MemoryType"]?.ToString(), out int memoryType))
                    {
                        module.Type = GetMemoryTypeName(memoryType);
                    }

                    // Parse form factor (0=Unknown, 1=Other, 2=SIP, 3=DIP, 4=ZIP, 5=SOJ, 6=Proprietary, 7=SIMM, 8=DIMM, 9=TSOP, 10=PGA, 11=RIMM, 12=SODIMM, 13=SRIMM, 14=SMD, 15=SSMP, 16=QFP, 17=TQFP, 18=SOIC, 19=LCC, 20=PLCC, 21=BGA, 22=FPBGA, 23=LGA)
                    if (int.TryParse(mo["FormFactor"]?.ToString(), out int formFactor))
                    {
                        module.FormFactor = GetFormFactorName(formFactor);
                    }

                    module.DeviceLocator = mo["DeviceLocator"]?.ToString();
                    module.BankLabel = mo["BankLabel"]?.ToString();

                    modules.Add(module);
                    _logger.LogDebug("Memory module: {Manufacturer} {CapacityGB}GB {Speed}MHz", module.Manufacturer, module.CapacityGB, module.SpeedMHz);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing memory module from WMI");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting memory modules from WMI");
        }

        return modules;
    }

    /// <summary>
    /// Convert memory type code to readable name
    /// </summary>
    private static string GetMemoryTypeName(int type)
    {
        return type switch
        {
            0 => "Unknown",
            1 => "Other",
            2 => "DRAM",
            3 => "Synchronous DRAM",
            4 => "Cache DRAM",
            5 => "EDO",
            6 => "EDRAM",
            7 => "VRAM",
            8 => "SRAM",
            9 => "RAM",
            10 => "ROM",
            11 => "Flash",
            12 => "EEPROM",
            13 => "FEPROM",
            14 => "EPROM",
            15 => "CDRAM",
            16 => "3DRAM",
            17 => "SDRAM",
            18 => "SGRAM",
            19 => "RDRAM",
            20 => "DDR",
            21 => "DDR2",
            22 => "DDR2 FB-DIMM",
            24 => "DDR3",
            25 => "FBD2",
            26 => "DDR4",
            27 => "LPDDR",
            28 => "LPDDR2",
            29 => "LPDDR3",
            30 => "LPDDR4",
            31 => "Logical non-volatile device",
            32 => "HBM",
            33 => "HBM2",
            34 => "DDR5",
            35 => "LPDDR5",
            _ => "Unknown"
        };
    }

    /// <summary>
    /// Convert form factor code to readable name
    /// </summary>
    private static string GetFormFactorName(int formFactor)
    {
        return formFactor switch
        {
            0 => "Unknown",
            1 => "Other",
            2 => "SIP",
            3 => "DIP",
            4 => "ZIP",
            5 => "SOJ",
            6 => "Proprietary",
            7 => "SIMM",
            8 => "DIMM",
            9 => "TSOP",
            10 => "PGA",
            11 => "RIMM",
            12 => "SODIMM",
            13 => "SRIMM",
            14 => "SMD",
            15 => "SSMP",
            16 => "QFP",
            17 => "TQFP",
            18 => "SOIC",
            19 => "LCC",
            20 => "PLCC",
            21 => "BGA",
            22 => "FPBGA",
            23 => "LGA",
            _ => "Unknown"
        };
    }
}
