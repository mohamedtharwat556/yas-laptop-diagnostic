namespace YAS.HardwareAgent.Models;

/// <summary>
/// Physical storage information from Win32_DiskDrive and Win32_LogicalDisk
/// </summary>
public class StorageInfo
{
    public string? Model { get; set; }
    public string? Manufacturer { get; set; }
    public string? Type { get; set; }
    public double? CapacityGB { get; set; }
    public double? UsedGB { get; set; }
    public double? FreeGB { get; set; }
    public double? UsagePercent { get; set; }
    public string? Interface { get; set; }
    public string? MediaType { get; set; }
    public string? SerialNumber { get; set; }
    public string? DeviceID { get; set; }
    public string? Status { get; set; }
    public string? DriveLetter { get; set; }
    public string? Limitation { get; set; }
}

