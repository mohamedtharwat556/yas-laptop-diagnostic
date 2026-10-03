namespace YAS.HardwareAgent.Models;

/// <summary>
/// CPU information
/// </summary>
public class CpuInfo
{
    public string? Name { get; set; }
    public string? Manufacturer { get; set; }
    public int? Cores { get; set; }
    public int? LogicalProcessors { get; set; }
    public int? MaxClockMHz { get; set; }
}
