using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Infrastructure;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting operating system information
/// BATCH 6B-3: Real Windows OS data collection
/// Queries Win32_OperatingSystem for actual OS data
/// </summary>
public class OperatingSystemInfoService : IOperatingSystemInfoService
{
    private readonly ILogger<OperatingSystemInfoService> _logger;
    private readonly IWindowsHardwareProvider _hardwareProvider;

    public OperatingSystemInfoService(
        ILogger<OperatingSystemInfoService> logger,
        IWindowsHardwareProvider hardwareProvider)
    {
        _logger = logger;
        _hardwareProvider = hardwareProvider;
    }

    public async Task<OperatingSystemInfo> GetOperatingSystemInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Collecting operating system information from Windows");

        var osInfo = new OperatingSystemInfo();

        try
        {
            // Query Win32_OperatingSystem for OS information
            _logger.LogDebug("Querying Win32_OperatingSystem");
            var osResults = await _hardwareProvider.QueryWmiPropertiesAsync(
                "Win32_OperatingSystem",
                new[] { "Caption", "Version", "BuildNumber", "OSArchitecture", "InstallDate", "SystemDirectory" },
                null,
                cancellationToken);

            var os = osResults.FirstOrDefault() as Dictionary<string, object?>;
            if (os != null)
            {
                // Windows Edition (e.g., "Windows 11 Pro", "Windows 10 Home")
                osInfo.Name = os.TryGetValue("Caption", out var caption) ? caption?.ToString() : null;

                // OS Version (e.g., "10.0")
                osInfo.Version = os.TryGetValue("Version", out var version) ? version?.ToString() : null;

                // OS Build (e.g., "26200", "22621")
                osInfo.Build = os.TryGetValue("BuildNumber", out var build) ? build?.ToString() : null;

                // OS Architecture (e.g., "x64", "ARM64", "x86")
                osInfo.Architecture = os.TryGetValue("OSArchitecture", out var arch) ? arch?.ToString() : null;

                // System Directory (e.g., "C:\\Windows\\System32")
                osInfo.SystemDirectory = os.TryGetValue("SystemDirectory", out var sysDir) ? sysDir?.ToString() : null;

                // Install Date (may be unreliable - treat as best-effort)
                if (os.TryGetValue("InstallDate", out var installDate) && installDate != null)
                {
                    try
                    {
                        // WMI returns InstallDate as a string in format "YYYYMMDDHHMMSS.SSSSSS±UTS"
                        if (installDate is string dateStr && dateStr.Length >= 14)
                        {
                            if (DateTime.TryParseExact(
                                dateStr.Substring(0, 14),
                                "yyyyMMddHHmmss",
                                null,
                                System.Globalization.DateTimeStyles.None,
                                out var parsedDate))
                            {
                                osInfo.InstallDate = parsedDate;
                                _logger.LogDebug("OS Install date parsed: {InstallDate}", osInfo.InstallDate);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogDebug(ex, "Failed to parse OS install date, treating as unavailable");
                        osInfo.InstallDate = null;
                    }
                }

                _logger.LogInformation("Operating system info collected: Name={Name}, Version={Version}, Build={Build}, Architecture={Architecture}",
                    osInfo.Name ?? "N/A",
                    osInfo.Version ?? "N/A",
                    osInfo.Build ?? "N/A",
                    osInfo.Architecture ?? "N/A");
            }
            else
            {
                _logger.LogWarning("Win32_OperatingSystem query returned no results");
            }

            _logger.LogInformation("Operating system information collection completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting operating system information");
        }

        return osInfo;
    }
}
