namespace YAS.HardwareAgent.Models;

/// <summary>
/// GPU information
/// </summary>
public class GpuInfo
{
    public string? Name { get; set; }
    public string? Manufacturer { get; set; }
    public long? DedicatedMemoryBytes { get; set; }
    public double? DedicatedMemoryGB { get; set; }
    public string? DriverVersion { get; set; }
}
