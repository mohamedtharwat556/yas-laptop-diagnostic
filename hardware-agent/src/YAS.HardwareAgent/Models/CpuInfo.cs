namespace YAS.HardwareAgent.Models;

/// <summary>
/// CPU information collected from Win32_Processor WMI
/// </summary>
public class CpuInfo
{
    /// <summary>
    /// CPU name/model (e.g., "Intel(R) Core(TM) i5-8350U CPU @ 1.70GHz")
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// CPU manufacturer (e.g., "GenuineIntel", "AuthenticAMD")
    /// </summary>
    public string? Manufacturer { get; set; }

    /// <summary>
    /// CPU description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Number of physical cores
    /// </summary>
    public int? Cores { get; set; }

    /// <summary>
    /// Number of logical processors (hyper-threads)
    /// </summary>
    public int? LogicalProcessors { get; set; }

    /// <summary>
    /// Maximum clock speed in MHz
    /// </summary>
    public int? MaxClockMHz { get; set; }

    /// <summary>
    /// Current clock speed in MHz
    /// </summary>
    public int? CurrentClockMHz { get; set; }

    /// <summary>
    /// CPU architecture (e.g., "x64", "x86")
    /// </summary>
    public string? Architecture { get; set; }

    /// <summary>
    /// Processor ID
    /// </summary>
    public string? ProcessorId { get; set; }

    /// <summary>
    /// Socket designation (e.g., "U3E1")
    /// </summary>
    public string? SocketDesignation { get; set; }

    /// <summary>
    /// L2 cache size in KB
    /// </summary>
    public int? L2CacheSizeKB { get; set; }

    /// <summary>
    /// L3 cache size in KB
    /// </summary>
    public int? L3CacheSizeKB { get; set; }
}
