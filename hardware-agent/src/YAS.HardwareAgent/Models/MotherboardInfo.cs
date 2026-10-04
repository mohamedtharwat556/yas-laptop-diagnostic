namespace YAS.HardwareAgent.Models;

/// <summary>
/// Motherboard information from Win32_BaseBoard WMI
/// </summary>
public class MotherboardInfo
{
    public string? Manufacturer { get; set; }
    public string? Product { get; set; }
    public string? Version { get; set; }
    public string? SerialNumber { get; set; }
    public string? Status { get; set; }
}
