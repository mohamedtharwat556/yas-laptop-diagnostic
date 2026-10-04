using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service to normalize HardwareResponse to NormalizedHardwareResponse
/// Wraps all values with source and confidence information for frontend consumption
/// </summary>
public class HardwareNormalizerService
{
    public static NormalizedHardwareResponse Normalize(HardwareResponse response)
    {
        return new NormalizedHardwareResponse
        {
            Computer = NormalizeComputer(response.Computer),
            OperatingSystem = NormalizeOperatingSystem(response.OperatingSystem),
            Cpu = NormalizeCpu(response.Cpu),
            Memory = NormalizeMemory(response.Memory),
            Gpu = response.Gpu?.Select(NormalizeGpu).ToList(),
            Storage = response.Storage?.Select(NormalizeStorage).ToList(),
            Battery = NormalizeBattery(response.Battery),
            Network = response.Network?.Select(NormalizeNetwork).ToList(),
            Motherboard = NormalizeMotherboard(response.Motherboard),
            Bios = NormalizeBios(response.Bios),
            CapturedAt = response.Metadata?.CapturedAt ?? DateTime.UtcNow
        };
    }

    private static NormalizedComputer NormalizeComputer(ComputerInfo? computer)
    {
        return new NormalizedComputer
        {
            Manufacturer = Wrap(computer?.Manufacturer),
            Model = Wrap(computer?.Model),
            ComputerName = Wrap(computer?.ComputerName),
            DeviceType = Wrap(computer?.DeviceType),
            SerialNumber = Wrap(computer?.SerialNumber)
        };
    }

    private static NormalizedOperatingSystem NormalizeOperatingSystem(OperatingSystemInfo? os)
    {
        return new NormalizedOperatingSystem
        {
            Name = Wrap(os?.Name),
            Version = Wrap(os?.Version),
            Build = Wrap(os?.Build),
            Architecture = Wrap(os?.Architecture)
        };
    }

    private static NormalizedCpu NormalizeCpu(CpuInfo? cpu)
    {
        return new NormalizedCpu
        {
            Name = Wrap(cpu?.Name),
            Manufacturer = Wrap(cpu?.Manufacturer),
            Cores = Wrap(cpu?.Cores),
            LogicalProcessors = Wrap(cpu?.LogicalProcessors),
            MaxClockMHz = Wrap(cpu?.MaxClockMHz),
            CurrentClockMHz = Wrap(cpu?.CurrentClockMHz),
            Architecture = Wrap(cpu?.Architecture),
            L2CacheSizeKB = Wrap(cpu?.L2CacheSizeKB),
            L3CacheSizeKB = Wrap(cpu?.L3CacheSizeKB)
        };
    }

    private static NormalizedMemory NormalizeMemory(MemoryInfo? memory)
    {
        return new NormalizedMemory
        {
            TotalGB = Wrap(memory?.TotalGB),
            UsedGB = Wrap(memory?.UsedGB),
            AvailableGB = Wrap(memory?.AvailableGB),
            UsagePercent = Wrap(memory?.UsagePercent),
            Modules = memory?.Modules?.Select(m => new NormalizedMemoryModule
            {
                Manufacturer = Wrap(m.Manufacturer),
                CapacityGB = Wrap(m.CapacityGB),
                Type = Wrap(m.Type),
                SpeedMHz = Wrap(m.SpeedMHz),
                FormFactor = Wrap(m.FormFactor),
                DeviceLocator = Wrap(m.DeviceLocator)
            }).ToList()
        };
    }

    private static NormalizedGpu NormalizeGpu(GpuInfo gpu)
    {
        return new NormalizedGpu
        {
            Name = Wrap(gpu.Name),
            Manufacturer = Wrap(gpu.Manufacturer),
            DedicatedMemoryGB = Wrap(gpu.DedicatedMemoryGB),
            DriverVersion = Wrap(gpu.DriverVersion),
            DriverDate = Wrap(gpu.DriverDate),
            CurrentResolution = Wrap(gpu.CurrentResolution),
            Status = Wrap(gpu.Status)
        };
    }

    private static NormalizedStorage NormalizeStorage(StorageInfo storage)
    {
        return new NormalizedStorage
        {
            Model = Wrap(storage.Model),
            Manufacturer = Wrap(storage.Manufacturer),
            Type = Wrap(storage.Type),
            CapacityGB = Wrap(storage.CapacityGB),
            UsedGB = Wrap(storage.UsedGB),
            FreeGB = Wrap(storage.FreeGB),
            UsagePercent = Wrap(storage.UsagePercent),
            Interface = Wrap(storage.Interface),
            MediaType = Wrap(storage.MediaType),
            DriveLetter = Wrap(storage.DriveLetter),
            Status = Wrap(storage.Status, storage.Limitation)
        };
    }

    private static NormalizedBattery NormalizeBattery(BatteryInfo? battery)
    {
        return new NormalizedBattery
        {
            Present = Wrap(battery?.Present),
            Percentage = Wrap(battery?.Percentage),
            Charging = Wrap(battery?.Charging),
            HealthPercent = Wrap(battery?.HealthPercent),
            HealthStatus = Wrap(battery?.HealthStatus, battery?.Limitation),
            Status = Wrap(battery?.Status),
            CycleCount = Wrap(battery?.CycleCount)
        };
    }

    private static NormalizedNetwork NormalizeNetwork(NetworkInfo network)
    {
        return new NormalizedNetwork
        {
            Name = Wrap(network.Name),
            Description = Wrap(network.Description),
            Manufacturer = Wrap(network.Manufacturer),
            Type = Wrap(network.Type),
            Connected = Wrap(network.Connected),
            Enabled = Wrap(network.Enabled),
            Speed = Wrap(network.Speed),
            Status = Wrap(network.Status),
            IPAddresses = network.IPAddresses?.Select(ip => Wrap(ip)).ToList(),
            IPv6Addresses = network.IPv6Addresses?.Select(ipv6 => Wrap(ipv6)).ToList()
        };
    }

    private static NormalizedMotherboard NormalizeMotherboard(MotherboardInfo? mb)
    {
        return new NormalizedMotherboard
        {
            Manufacturer = Wrap(mb?.Manufacturer),
            Product = Wrap(mb?.Product),
            Version = Wrap(mb?.Version)
        };
    }

    private static NormalizedBios NormalizeBios(BiosInfo? bios)
    {
        return new NormalizedBios
        {
            Manufacturer = Wrap(bios?.Manufacturer),
            Version = Wrap(bios?.Version),
            ReleaseDate = Wrap(bios?.ReleaseDate)
        };
    }

    /// <summary>
    /// Wrap a value with default source/confidence
    /// </summary>
    private static HardwareFieldValue<T> Wrap<T>(T? value, string? limitation = null)
    {
        return new HardwareFieldValue<T>(
            value,
            source: "hardware-agent",
            confidence: value != null ? "HIGH" : "UNKNOWN",
            limitation: limitation
        );
    }
}
