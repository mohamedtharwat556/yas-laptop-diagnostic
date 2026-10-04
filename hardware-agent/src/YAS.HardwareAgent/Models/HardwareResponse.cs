namespace YAS.HardwareAgent.Models;

/// <summary>
/// Complete hardware information response
/// </summary>
public class HardwareResponse
{
    public ComputerInfo Computer { get; set; } = new();
    public OperatingSystemInfo OperatingSystem { get; set; } = new();
    public CpuInfo Cpu { get; set; } = new();
    public MemoryInfo Memory { get; set; } = new();
    public List<GpuInfo> Gpu { get; set; } = new();
    public List<StorageInfo> Storage { get; set; } = new();
    public BatteryInfo Battery { get; set; } = new();
    public List<NetworkInfo> Network { get; set; } = new();
    public MotherboardInfo Motherboard { get; set; } = new();
    public BiosInfo Bios { get; set; } = new();
    public HardwareMetadata Metadata { get; set; } = new();
}
