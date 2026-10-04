namespace YAS.HardwareAgent.Models;

/// <summary>
/// Memory (RAM) information collected from Win32_ComputerSystem and Win32_PhysicalMemory WMI
/// </summary>
public class MemoryInfo
{
    /// <summary>
    /// Total physical memory in bytes
    /// </summary>
    public long? TotalBytes { get; set; }

    /// <summary>
    /// Total physical memory in GB
    /// </summary>
    public double? TotalGB { get; set; }

    /// <summary>
    /// Used memory in bytes (calculated: TotalBytes - AvailableBytes)
    /// </summary>
    public long? UsedBytes { get; set; }

    /// <summary>
    /// Used memory in GB
    /// </summary>
    public double? UsedGB { get; set; }

    /// <summary>
    /// Available memory in bytes
    /// </summary>
    public long? AvailableBytes { get; set; }

    /// <summary>
    /// Available memory in GB
    /// </summary>
    public double? AvailableGB { get; set; }

    /// <summary>
    /// Memory usage percentage (0-100)
    /// </summary>
    public double? UsagePercent { get; set; }

    /// <summary>
    /// Individual memory modules
    /// </summary>
    public List<MemoryModule> Modules { get; set; } = new();
}

/// <summary>
/// Individual memory module information from Win32_PhysicalMemory WMI
/// </summary>
public class MemoryModule
{
    /// <summary>
    /// RAM manufacturer (e.g., "Samsung", "SK Hynix")
    /// </summary>
    public string? Manufacturer { get; set; }

    /// <summary>
    /// Module capacity in bytes
    /// </summary>
    public long? CapacityBytes { get; set; }

    /// <summary>
    /// Module capacity in GB
    /// </summary>
    public double? CapacityGB { get; set; }

    /// <summary>
    /// Memory type (e.g., "DDR4", "DDR5")
    /// </summary>
    public string? Type { get; set; }

    /// <summary>
    /// Speed in MHz
    /// </summary>
    public int? SpeedMHz { get; set; }

    /// <summary>
    /// Configured clock speed in MHz
    /// </summary>
    public int? ConfiguredClockSpeedMHz { get; set; }

    /// <summary>
    /// Part number
    /// </summary>
    public string? PartNumber { get; set; }

    /// <summary>
    /// Serial number
    /// </summary>
    public string? SerialNumber { get; set; }

    /// <summary>
    /// Form factor (e.g., "SODIMM", "DIMM")
    /// </summary>
    public string? FormFactor { get; set; }

    /// <summary>
    /// Device locator (e.g., "DIMM1", "ChannelA-DIMM0")
    /// </summary>
    public string? DeviceLocator { get; set; }

    /// <summary>
    /// Bank label
    /// </summary>
    public string? BankLabel { get; set; }
}
