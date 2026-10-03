using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Infrastructure;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting computer information
/// BATCH 6B-3: Real Windows data collection
/// Queries Win32_ComputerSystem and Win32_BIOS for actual hardware data
/// </summary>
public class ComputerInfoService : IComputerInfoService
{
    private readonly ILogger<ComputerInfoService> _logger;
    private readonly IWindowsHardwareProvider _hardwareProvider;

    public ComputerInfoService(
        ILogger<ComputerInfoService> logger,
        IWindowsHardwareProvider hardwareProvider)
    {
        _logger = logger;
        _hardwareProvider = hardwareProvider;
    }

    public async Task<ComputerInfo> GetComputerInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Collecting computer information from Windows");

        var computerInfo = new ComputerInfo();

        try
        {
            // Query Win32_ComputerSystem for manufacturer and model
            _logger.LogDebug("Querying Win32_ComputerSystem");
            var computerSystemResults = await _hardwareProvider.QueryWmiPropertiesAsync(
                "Win32_ComputerSystem",
                new[] { "Manufacturer", "Model", "Name", "PCSystemType" },
                null,
                cancellationToken);

            var computerSystem = computerSystemResults.FirstOrDefault() as Dictionary<string, object?>;
            if (computerSystem != null)
            {
                computerInfo.Manufacturer = computerSystem.TryGetValue("Manufacturer", out var mfg) ? mfg?.ToString() : null;
                computerInfo.Model = computerSystem.TryGetValue("Model", out var mdl) ? mdl?.ToString() : null;
                computerInfo.ComputerName = computerSystem.TryGetValue("Name", out var name) ? name?.ToString() : null;

                // Determine device type from PCSystemType
                if (computerSystem.TryGetValue("PCSystemType", out var pcType) && pcType != null)
                {
                    computerInfo.DeviceType = DeterminePCSystemType((uint?)pcType);
                }

                _logger.LogInformation("Computer info collected: Manufacturer={Manufacturer}, Model={Model}, Name={ComputerName}",
                    computerInfo.Manufacturer ?? "N/A",
                    computerInfo.Model ?? "N/A",
                    computerInfo.ComputerName ?? "N/A");
            }
            else
            {
                _logger.LogWarning("Win32_ComputerSystem query returned no results");
            }

            // Query Win32_BIOS for serial number
            _logger.LogDebug("Querying Win32_BIOS for serial number");
            var biosResults = await _hardwareProvider.QueryWmiPropertiesAsync(
                "Win32_BIOS",
                new[] { "SerialNumber" },
                null,
                cancellationToken);

            var bios = biosResults.FirstOrDefault() as Dictionary<string, object?>;
            if (bios != null && bios.TryGetValue("SerialNumber", out var serialNumber))
            {
                computerInfo.SerialNumber = serialNumber?.ToString();
                if (!string.IsNullOrEmpty(computerInfo.SerialNumber))
                {
                    _logger.LogDebug("Serial number collected: {SerialNumber}", computerInfo.SerialNumber);
                }
            }
            else
            {
                _logger.LogDebug("Serial number not available from BIOS");
            }

            _logger.LogInformation("Computer information collection completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting computer information");
        }

        return computerInfo;
    }

    /// <summary>
    /// Determine device type from PCSystemType
    /// Reference: https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-computersystem
    /// </summary>
    private string? DeterminePCSystemType(uint? pcSystemType)
    {
        if (!pcSystemType.HasValue)
            return null;

        return pcSystemType.Value switch
        {
            0 => "Unknown",
            1 => "Desktop",
            2 => "Laptop", // Mobile
            3 => "Workstation",
            4 => "Desktop", // Enterprise
            5 => "Laptop", // Tablet
            6 => "Laptop", // Mobile
            7 => "Desktop", // Thin Client
            8 => "Desktop", // Slate
            9 => "Desktop", // All-in-One
            10 => "Desktop", // Sub Notebook
            11 => "Desktop", // Netbook
            _ => null
        };
    }
}
