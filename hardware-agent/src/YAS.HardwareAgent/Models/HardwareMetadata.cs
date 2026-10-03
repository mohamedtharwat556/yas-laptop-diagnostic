namespace YAS.HardwareAgent.Models;

/// <summary>
/// Hardware collection metadata
/// </summary>
public class HardwareMetadata
{
    public string Source { get; set; } = "hardware-agent";
    public DateTime? CapturedAt { get; set; } = DateTime.UtcNow;
}
