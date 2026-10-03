namespace YAS.HardwareAgent.Models;

/// <summary>
/// Network adapter information
/// </summary>
public class NetworkInfo
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Type { get; set; }
    public string? MACAddress { get; set; }
    public List<string>? IPAddresses { get; set; }
    public bool? Connected { get; set; }
}
