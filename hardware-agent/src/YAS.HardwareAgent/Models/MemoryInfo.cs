namespace YAS.HardwareAgent.Models;

/// <summary>
/// Memory (RAM) information
/// </summary>
public class MemoryInfo
{
    public long? TotalBytes { get; set; }
    public double? TotalGB { get; set; }
    public List<MemoryModule> Modules { get; set; } = new();
}

/// <summary>
/// Individual memory module
/// </summary>
public class MemoryModule
{
    public string? Manufacturer { get; set; }
    public long? CapacityBytes { get; set; }
    public double? CapacityGB { get; set; }
    public string? Type { get; set; }
    public int? SpeedMHz { get; set; }
}
