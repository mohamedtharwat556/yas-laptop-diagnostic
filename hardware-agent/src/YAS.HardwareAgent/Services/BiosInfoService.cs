using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real BIOS information from Windows WMI
/// Uses Win32_BIOS to query BIOS/UEFI details
/// </summary>
public class BiosInfoService : IBiosInfoService
{
    private readonly ILogger<BiosInfoService> _logger;

    public BiosInfoService(ILogger<BiosInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<BiosInfo> GetBiosInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting BIOS information from Win32_BIOS WMI");

        var bios = new BiosInfo();

        try
        {
            // Query Win32_BIOS for BIOS info
            var biosQuery = "SELECT Manufacturer, Version, ReleaseDate, SerialNumber, SMBIOSVersion, BIOSVersion FROM Win32_BIOS";
            
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery(biosQuery);
            var searcher = new ManagementObjectSearcher(scope, query);

            foreach (ManagementObject mo in searcher.Get())
            {
                try
                {
                    bios.Manufacturer = mo["Manufacturer"]?.ToString();
                    bios.Version = mo["Version"]?.ToString();
                    bios.SerialNumber = mo["SerialNumber"]?.ToString();
                    bios.SMBIOSVersion = mo["SMBIOSVersion"]?.ToString();
                    bios.BIOSVersion = mo["BIOSVersion"]?.ToString();
                    bios.ReleaseDate = FormatReleaseDate(mo["ReleaseDate"]?.ToString());

                    _logger.LogInformation("BIOS collected: {Manufacturer} {Version}", 
                        bios.Manufacturer, bios.Version);
                    break; // Use first BIOS entry
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing BIOS information");
                }
            }

            return await Task.FromResult(bios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting BIOS information");
            return await Task.FromResult(new BiosInfo());
        }
    }

    /// <summary>
    /// Format BIOS release date from WMI format (YYYYMMDD) to readable format
    /// </summary>
    private string? FormatReleaseDate(string? releaseDate)
    {
        if (string.IsNullOrEmpty(releaseDate) || releaseDate.Length < 8)
            return null;

        try
        {
            string dateOnly = releaseDate.Substring(0, 8);
            if (DateTime.TryParseExact(dateOnly, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out DateTime parsedDate))
            {
                return parsedDate.ToString("yyyy-MM-dd");
            }
        }
        catch
        {
            // Return as-is if parsing fails
        }

        return releaseDate;
    }
}
