namespace YAS.HardwareAgent.Models;

/// <summary>
/// GPU information from Win32_VideoController WMI
/// </summary>
public class GpuInfo
{
    public string? Name { get; set; }
    public string? Manufacturer { get; set; }
    public long? DedicatedMemoryBytes { get; set; }
    public double? DedicatedMemoryGB { get; set; }
    public string? DriverVersion { get; set; }
    public string? DriverDate { get; set; }
    public string? CurrentResolution { get; set; }
    public string? Status { get; set; }
    public string? VideoProcessor { get; set; }
    public string? PNPDeviceID { get; set; }
}
