namespace YAS.HardwareAgent.Models;

/// <summary>
/// Battery information
/// </summary>
public class BatteryInfo
{
    public bool? Present { get; set; }
    public int? Percentage { get; set; }
    public bool? Charging { get; set; }
    public double? DesignCapacityWh { get; set; }
    public double? FullChargeCapacityWh { get; set; }
    public int? CycleCount { get; set; }
}
