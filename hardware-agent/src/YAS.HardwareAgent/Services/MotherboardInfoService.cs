using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real motherboard information from Windows WMI
/// Uses Win32_BaseBoard to query motherboard details
/// </summary>
public class MotherboardInfoService : IMotherboardInfoService
{
    private readonly ILogger<MotherboardInfoService> _logger;

    public MotherboardInfoService(ILogger<MotherboardInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<MotherboardInfo> GetMotherboardInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting motherboard information from Win32_BaseBoard WMI");

        var motherboard = new MotherboardInfo();

        try
        {
            // Query Win32_BaseBoard for motherboard info
            var motherboardQuery = "SELECT Manufacturer, Product, Version, SerialNumber, Status FROM Win32_BaseBoard";
            
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery(motherboardQuery);
            var searcher = new ManagementObjectSearcher(scope, query);

            foreach (ManagementObject mo in searcher.Get())
            {
                try
                {
                    motherboard.Manufacturer = mo["Manufacturer"]?.ToString();
                    motherboard.Product = mo["Product"]?.ToString();
                    motherboard.Version = mo["Version"]?.ToString();
                    motherboard.SerialNumber = mo["SerialNumber"]?.ToString();
                    motherboard.Status = mo["Status"]?.ToString();

                    _logger.LogInformation("Motherboard collected: {Manufacturer} {Product}", 
                        motherboard.Manufacturer, motherboard.Product);
                    break; // Use first motherboard entry
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing motherboard information");
                }
            }

            return await Task.FromResult(motherboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting motherboard information");
            return await Task.FromResult(new MotherboardInfo());
        }
    }
}
