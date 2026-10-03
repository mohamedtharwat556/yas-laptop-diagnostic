namespace YAS.HardwareAgent.Models;

/// <summary>
/// Physical storage information
/// </summary>
public class StorageInfo
{
    public string? Model { get; set; }
    public string? Type { get; set; }
    public double? CapacityGB { get; set; }
    public double? UsedGB { get; set; }
    public double? FreeGB { get; set; }
    public string? Interface { get; set; }
    public string? MediaType { get; set; }
}
