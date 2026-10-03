namespace YAS.HardwareAgent.Models;

/// <summary>
/// Operating system information
/// BATCH 6B-3: Real Windows OS data collection
/// </summary>
public class OperatingSystemInfo
{
    /// <summary>
    /// Windows edition name (e.g., "Windows 11 Pro", "Windows 10 Home")
    /// Source: Win32_OperatingSystem.Caption
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// OS version (e.g., "10.0" for Windows 10/11)
    /// Source: Win32_OperatingSystem.Version
    /// </summary>
    public string? Version { get; set; }

    /// <summary>
    /// OS build number (e.g., "26200", "22621")
    /// Source: Win32_OperatingSystem.BuildNumber
    /// </summary>
    public string? Build { get; set; }

    /// <summary>
    /// OS architecture (e.g., "x64", "x86", "ARM64")
    /// Source: Win32_OperatingSystem.OSArchitecture or Environment.Is64BitOperatingSystem
    /// </summary>
    public string? Architecture { get; set; }

    /// <summary>
    /// Windows installation date/time
    /// Source: Win32_OperatingSystem.InstallDate (may be unreliable)
    /// </summary>
    public DateTime? InstallDate { get; set; }

    /// <summary>
    /// System directory path (e.g., "C:\\Windows\\System32")
    /// Source: Win32_OperatingSystem.SystemDirectory or Environment.SystemDirectory
    /// </summary>
    public string? SystemDirectory { get; set; }
}
