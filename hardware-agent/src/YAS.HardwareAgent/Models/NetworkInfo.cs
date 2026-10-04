namespace YAS.HardwareAgent.Models;

/// <summary>
/// Network adapter information from Win32_NetworkAdapter
/// </summary>
public class NetworkInfo
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Type { get; set; }
    public string? Manufacturer { get; set; }
    public string? MACAddress { get; set; }
    public List<string>? IPAddresses { get; set; }
    public List<string>? IPv6Addresses { get; set; }
    public bool? Connected { get; set; }
    public bool? Enabled { get; set; }
    public string? Speed { get; set; }
    public string? Status { get; set; }
    public string? AdapterType { get; set; }
    public string? ServiceName { get; set; }
}
