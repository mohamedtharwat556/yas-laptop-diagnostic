namespace YAS.HardwareAgent.Models;

/// <summary>
/// BIOS/UEFI information from Win32_BIOS WMI
/// </summary>
public class BiosInfo
{
    public string? Manufacturer { get; set; }
    public string? Version { get; set; }
    public string? ReleaseDate { get; set; }
    public string? SerialNumber { get; set; }
    public string? SMBIOSVersion { get; set; }
    public string? BIOSVersion { get; set; }
}
