namespace YAS.HardwareAgent.Models;

/// <summary>
/// Computer information
/// BATCH 6B-3: Real Windows data collection
/// </summary>
public class ComputerInfo
{
    /// <summary>
    /// Computer manufacturer (e.g., "LENOVO", "Dell", "HP")
    /// Source: Win32_ComputerSystem.Manufacturer
    /// </summary>
    public string? Manufacturer { get; set; }

    /// <summary>
    /// Computer model (e.g., "20L5", "XPS 13")
    /// Source: Win32_ComputerSystem.Model
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// Device type (e.g., "Laptop", "Desktop", "Workstation")
    /// Source: Win32_ComputerSystem.PCSystemType / Chassis Type
    /// </summary>
    public string? DeviceType { get; set; }

    /// <summary>
    /// Serial number from BIOS
    /// Source: Win32_BIOS.SerialNumber
    /// </summary>
    public string? SerialNumber { get; set; }

    /// <summary>
    /// Computer name on network
    /// Source: Win32_ComputerSystem.Name or Environment variable
    /// </summary>
    public string? ComputerName { get; set; }
}
