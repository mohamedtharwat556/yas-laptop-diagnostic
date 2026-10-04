namespace YAS.HardwareAgent.Models;

/// <summary>
/// Normalized hardware response for frontend consumption
/// All values wrapped with source and confidence information
/// </summary>
public class NormalizedHardwareResponse
{
    public NormalizedComputer? Computer { get; set; }
    public NormalizedOperatingSystem? OperatingSystem { get; set; }
    public NormalizedCpu? Cpu { get; set; }
    public NormalizedMemory? Memory { get; set; }
    public List<NormalizedGpu>? Gpu { get; set; }
    public List<NormalizedStorage>? Storage { get; set; }
    public NormalizedBattery? Battery { get; set; }
    public List<NormalizedNetwork>? Network { get; set; }
    public NormalizedMotherboard? Motherboard { get; set; }
    public NormalizedBios? Bios { get; set; }
    public DateTime CapturedAt { get; set; }
}

public class NormalizedComputer
{
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<string>? Model { get; set; }
    public HardwareFieldValue<string>? ComputerName { get; set; }
    public HardwareFieldValue<string>? DeviceType { get; set; }
    public HardwareFieldValue<string>? SerialNumber { get; set; }
}

public class NormalizedOperatingSystem
{
    public HardwareFieldValue<string>? Name { get; set; }
    public HardwareFieldValue<string>? Version { get; set; }
    public HardwareFieldValue<string>? Build { get; set; }
    public HardwareFieldValue<string>? Architecture { get; set; }
}

public class NormalizedCpu
{
    public HardwareFieldValue<string>? Name { get; set; }
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<int?>? Cores { get; set; }
    public HardwareFieldValue<int?>? LogicalProcessors { get; set; }
    public HardwareFieldValue<int?>? MaxClockMHz { get; set; }
    public HardwareFieldValue<int?>? CurrentClockMHz { get; set; }
    public HardwareFieldValue<string>? Architecture { get; set; }
    public HardwareFieldValue<int?>? L2CacheSizeKB { get; set; }
    public HardwareFieldValue<int?>? L3CacheSizeKB { get; set; }
}

public class NormalizedMemory
{
    public HardwareFieldValue<double?>? TotalGB { get; set; }
    public HardwareFieldValue<double?>? UsedGB { get; set; }
    public HardwareFieldValue<double?>? AvailableGB { get; set; }
    public HardwareFieldValue<double?>? UsagePercent { get; set; }
    public List<NormalizedMemoryModule>? Modules { get; set; }
}

public class NormalizedMemoryModule
{
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<double?>? CapacityGB { get; set; }
    public HardwareFieldValue<string>? Type { get; set; }
    public HardwareFieldValue<int?>? SpeedMHz { get; set; }
    public HardwareFieldValue<string>? FormFactor { get; set; }
    public HardwareFieldValue<string>? DeviceLocator { get; set; }
}

public class NormalizedGpu
{
    public HardwareFieldValue<string>? Name { get; set; }
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<double?>? DedicatedMemoryGB { get; set; }
    public HardwareFieldValue<string>? DriverVersion { get; set; }
    public HardwareFieldValue<string>? DriverDate { get; set; }
    public HardwareFieldValue<string>? CurrentResolution { get; set; }
    public HardwareFieldValue<string>? Status { get; set; }
}

public class NormalizedStorage
{
    public HardwareFieldValue<string>? Model { get; set; }
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<string>? Type { get; set; }
    public HardwareFieldValue<double?>? CapacityGB { get; set; }
    public HardwareFieldValue<double?>? UsedGB { get; set; }
    public HardwareFieldValue<double?>? FreeGB { get; set; }
    public HardwareFieldValue<double?>? UsagePercent { get; set; }
    public HardwareFieldValue<string>? Interface { get; set; }
    public HardwareFieldValue<string>? MediaType { get; set; }
    public HardwareFieldValue<string>? DriveLetter { get; set; }
    public HardwareFieldValue<string>? Status { get; set; }
}

public class NormalizedBattery
{
    public HardwareFieldValue<bool?>? Present { get; set; }
    public HardwareFieldValue<int?>? Percentage { get; set; }
    public HardwareFieldValue<bool?>? Charging { get; set; }
    public HardwareFieldValue<int?>? HealthPercent { get; set; }
    public HardwareFieldValue<string>? HealthStatus { get; set; }
    public HardwareFieldValue<string>? Status { get; set; }
    public HardwareFieldValue<int?>? CycleCount { get; set; }
}

public class NormalizedNetwork
{
    public HardwareFieldValue<string>? Name { get; set; }
    public HardwareFieldValue<string>? Description { get; set; }
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<string>? Type { get; set; }
    public HardwareFieldValue<bool?>? Connected { get; set; }
    public HardwareFieldValue<bool?>? Enabled { get; set; }
    public HardwareFieldValue<string>? Speed { get; set; }
    public HardwareFieldValue<string>? Status { get; set; }
    public List<HardwareFieldValue<string>>? IPAddresses { get; set; }
    public List<HardwareFieldValue<string>>? IPv6Addresses { get; set; }
}

public class NormalizedMotherboard
{
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<string>? Product { get; set; }
    public HardwareFieldValue<string>? Version { get; set; }
}

public class NormalizedBios
{
    public HardwareFieldValue<string>? Manufacturer { get; set; }
    public HardwareFieldValue<string>? Version { get; set; }
    public HardwareFieldValue<string>? ReleaseDate { get; set; }
}
