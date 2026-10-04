namespace YAS.HardwareAgent.Models;

/// <summary>
/// Battery information from Win32_Battery WMI
/// </summary>
public class BatteryInfo
{
    public bool? Present { get; set; }
    public int? Percentage { get; set; }
    public bool? Charging { get; set; }
    public string? Status { get; set; }
    public double? DesignCapacityWh { get; set; }
    public double? FullChargeCapacityWh { get; set; }
    public double? CurrentCapacityWh { get; set; }
    public int? HealthPercent { get; set; }
    public int? CycleCount { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public int? Voltage { get; set; }
    public string? HealthStatus { get; set; }
    public string? Limitation { get; set; }
}
