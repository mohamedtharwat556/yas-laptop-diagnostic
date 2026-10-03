namespace YAS.HardwareAgent.Models;

/// <summary>
/// Agent information returned by health endpoint
/// </summary>
public class AgentInfo
{
    public string Status { get; set; } = "ok";
    public string Agent { get; set; } = "YAS Hardware Agent";
    public string Version { get; set; } = "1.0.0";
    public DateTime? Timestamp { get; set; } = DateTime.UtcNow;
}
