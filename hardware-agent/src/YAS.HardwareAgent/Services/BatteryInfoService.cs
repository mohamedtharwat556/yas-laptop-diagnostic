using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real battery information from Windows WMI
/// Uses Win32_Battery to query battery status and health
/// </summary>
public class BatteryInfoService : IBatteryInfoService
{
    private readonly ILogger<BatteryInfoService> _logger;

    public BatteryInfoService(ILogger<BatteryInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<BatteryInfo> GetBatteryInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting battery information from Win32_Battery WMI");

        var battery = new BatteryInfo();

        try
        {
            // Query Win32_Battery for battery status
            var batteryQuery = "SELECT Name, Manufacturer, EstimatedChargeRemaining, EstimatedRunTime, BatteryStatus, Chemistry, DesignCapacity, FullChargeCapacity, CurrentCapacity, CycleCount, Voltage FROM Win32_Battery";
            
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery(batteryQuery);
            var searcher = new ManagementObjectSearcher(scope, query);

            ManagementObject? firstBattery = null;

            foreach (ManagementObject mo in searcher.Get())
            {
                // Use first battery found
                if (firstBattery == null)
                {
                    firstBattery = mo;
                }
            }

            if (firstBattery != null)
            {
                battery.Present = true;

                // Parse charge remaining (percentage)
                if (int.TryParse(firstBattery["EstimatedChargeRemaining"]?.ToString(), out int percentage))
                {
                    battery.Percentage = percentage;
                }

                // Parse battery status
                if (int.TryParse(firstBattery["BatteryStatus"]?.ToString(), out int statusCode))
                {
                    battery.Status = ParseBatteryStatus(statusCode);
                    battery.Charging = statusCode == 2; // 2 = Charging
                }

                // Parse capacities (in mWh, convert to Wh)
                if (long.TryParse(firstBattery["DesignCapacity"]?.ToString(), out long designCapacity))
                {
                    battery.DesignCapacityWh = designCapacity / 1000.0;
                }

                if (long.TryParse(firstBattery["FullChargeCapacity"]?.ToString(), out long fullCapacity))
                {
                    battery.FullChargeCapacityWh = fullCapacity / 1000.0;
                }

                if (long.TryParse(firstBattery["CurrentCapacity"]?.ToString(), out long currentCapacity))
                {
                    battery.CurrentCapacityWh = currentCapacity / 1000.0;
                }

                // Calculate battery health (only when we have both values)
                if (battery.DesignCapacityWh.HasValue && battery.DesignCapacityWh > 0 &&
                    battery.FullChargeCapacityWh.HasValue && battery.FullChargeCapacityWh > 0)
                {
                    double health = (battery.FullChargeCapacityWh.Value / battery.DesignCapacityWh.Value) * 100;
                    battery.HealthPercent = (int)Math.Round(health);
                    if (battery.HealthPercent.HasValue)
                    {
                        battery.HealthStatus = DetermineBatteryHealth(battery.HealthPercent.Value);
                    }
                }
                else
                {
                    battery.HealthStatus = "unavailable";
                    battery.Limitation = "Design Capacity or Full Charge Capacity not available";
                }

                // Parse cycle count
                if (int.TryParse(firstBattery["CycleCount"]?.ToString(), out int cycleCount) && cycleCount >= 0)
                {
                    battery.CycleCount = cycleCount;
                }

                // Parse voltage (in mV, convert to V)
                if (int.TryParse(firstBattery["Voltage"]?.ToString(), out int voltage))
                {
                    battery.Voltage = voltage / 1000;
                }

                battery.Model = firstBattery["Name"]?.ToString();
                battery.Manufacturer = firstBattery["Manufacturer"]?.ToString();

                _logger.LogInformation("Battery collected: {Model} - {Percentage}% - Health: {Health}%", 
                    battery.Model, battery.Percentage, battery.HealthPercent);
            }
            else
            {
                // No battery found (likely desktop)
                battery.Present = false;
                battery.HealthStatus = "unavailable";
                battery.Limitation = "No battery detected (desktop system)";
                _logger.LogInformation("No battery found - likely desktop system");
            }

            return await Task.FromResult(battery);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting battery information");
            
            // Return structure with null values and limitation info
            return await Task.FromResult(new BatteryInfo
            {
                Present = null,
                HealthStatus = "unavailable",
                Limitation = $"Error: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Parse battery status code from Win32_Battery
    /// </summary>
    private string ParseBatteryStatus(int statusCode)
    {
        return statusCode switch
        {
            1 => "Discharging",
            2 => "Charging",
            3 => "Critically Low",
            4 => "Charging, Low",
            5 => "Charging, Critical",
            6 => "Undefined",
            7 => "Partially Charged",
            _ => "Unknown"
        };
    }

    /// <summary>
    /// Determine battery health status based on health percentage
    /// </summary>
    private string DetermineBatteryHealth(int healthPercent)
    {
        if (healthPercent >= 90)
            return "Good";
        if (healthPercent >= 70)
            return "Fair";
        if (healthPercent >= 50)
            return "Poor";
        return "Critical";
    }
}
