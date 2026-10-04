using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real GPU information from Windows WMI
/// Uses Win32_VideoController to query actual graphics adapters
/// </summary>
public class GpuInfoService : IGpuInfoService
{
    private readonly ILogger<GpuInfoService> _logger;

    public GpuInfoService(ILogger<GpuInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<List<GpuInfo>> GetGpuInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting GPU information from Win32_VideoController WMI");

        var gpuList = new List<GpuInfo>();

        try
        {
            // Query Win32_VideoController for all GPUs
            var gpuQuery = "SELECT Name, AdapterRAM, DriverVersion, DriverDate, VideoProcessor, PNPDeviceID, Status, CurrentBitsPerPixel, CurrentRefreshRate, CurrentHorizontalResolution, CurrentVerticalResolution FROM Win32_VideoController";
            
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery(gpuQuery);
            var searcher = new ManagementObjectSearcher(scope, query);

            // Get all GPUs
            foreach (ManagementObject mo in searcher.Get())
            {
                try
                {
                    var gpu = new GpuInfo();
                    
                    gpu.Name = mo["Name"]?.ToString();
                    gpu.VideoProcessor = mo["VideoProcessor"]?.ToString();
                    gpu.Status = mo["Status"]?.ToString();
                    gpu.PNPDeviceID = mo["PNPDeviceID"]?.ToString();

                    // Parse adapter RAM (in bytes)
                    if (long.TryParse(mo["AdapterRAM"]?.ToString(), out long adapterRam))
                    {
                        gpu.DedicatedMemoryBytes = adapterRam;
                        gpu.DedicatedMemoryGB = Math.Round(adapterRam / (1024.0 * 1024.0 * 1024.0), 2);
                    }

                    gpu.DriverVersion = mo["DriverVersion"]?.ToString();
                    gpu.DriverDate = FormatDriverDate(mo["DriverDate"]?.ToString());

                    // Build resolution string if available
                    string? resolution = BuildResolutionString(mo);
                    if (!string.IsNullOrEmpty(resolution))
                    {
                        gpu.CurrentResolution = resolution;
                    }

                    // Try to extract manufacturer from Name
                    gpu.Manufacturer = ExtractManufacturer(gpu.Name);

                    gpuList.Add(gpu);
                    _logger.LogInformation("GPU collected: {Name} - {VRAM}GB", gpu.Name, gpu.DedicatedMemoryGB);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing GPU information from WMI");
                }
            }

            if (gpuList.Count == 0)
            {
                _logger.LogWarning("No GPUs found in Win32_VideoController");
            }

            return await Task.FromResult(gpuList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting GPU information");
            // Return empty list instead of throwing
            return await Task.FromResult(new List<GpuInfo>());
        }
    }

    /// <summary>
    /// Format driver date from WMI format (YYYYMMDD) to readable format
    /// </summary>
    private string? FormatDriverDate(string? driverDate)
    {
        if (string.IsNullOrEmpty(driverDate) || driverDate.Length < 8)
            return null;

        try
        {
            // WMI returns date as YYYYMMDDHHMMSS format, we only need first 8 characters
            string dateOnly = driverDate.Substring(0, 8);
            if (DateTime.TryParseExact(dateOnly, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out DateTime parsedDate))
            {
                return parsedDate.ToString("yyyy-MM-dd");
            }
        }
        catch
        {
            // Return as-is if parsing fails
        }

        return driverDate;
    }

    /// <summary>
    /// Build resolution string from horizontal and vertical resolution
    /// </summary>
    private string? BuildResolutionString(ManagementObject mo)
    {
        try
        {
            if (uint.TryParse(mo["CurrentHorizontalResolution"]?.ToString(), out uint width) &&
                uint.TryParse(mo["CurrentVerticalResolution"]?.ToString(), out uint height) &&
                width > 0 && height > 0)
            {
                uint? refreshRate = null;
                if (uint.TryParse(mo["CurrentRefreshRate"]?.ToString(), out uint rate) && rate > 0)
                {
                    refreshRate = rate;
                }

                if (refreshRate.HasValue)
                {
                    return $"{width}x{height} @ {refreshRate}Hz";
                }
                else
                {
                    return $"{width}x{height}";
                }
            }
        }
        catch
        {
            // Silently fail if we can't build resolution
        }

        return null;
    }

    /// <summary>
    /// Extract manufacturer from GPU name (Intel, NVIDIA, AMD)
    /// </summary>
    private string? ExtractManufacturer(string? gpuName)
    {
        if (string.IsNullOrEmpty(gpuName))
            return null;

        gpuName = gpuName.ToLower();

        if (gpuName.Contains("nvidia"))
            return "NVIDIA";
        if (gpuName.Contains("amd") || gpuName.Contains("radeon"))
            return "AMD";
        if (gpuName.Contains("intel"))
            return "Intel";
        if (gpuName.Contains("qualcomm"))
            return "Qualcomm";

        return null;
    }
}
