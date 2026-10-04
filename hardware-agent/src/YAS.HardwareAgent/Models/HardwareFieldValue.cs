namespace YAS.HardwareAgent.Models;

/// <summary>
/// Wrapper for hardware field values with source and confidence tracking
/// Used for normalized output that includes metadata about data origin
/// </summary>
public class HardwareFieldValue<T>
{
    /// <summary>
    /// The actual hardware value
    /// </summary>
    public T? Value { get; set; }

    /// <summary>
    /// Source of the data (e.g., "hardware-agent", "browser", "manual", "unavailable")
    /// </summary>
    public string Source { get; set; } = "hardware-agent";

    /// <summary>
    /// Confidence level of the value (HIGH, MEDIUM, LOW, UNKNOWN)
    /// </summary>
    public string Confidence { get; set; } = "HIGH";

    /// <summary>
    /// Optional limitation or reason if data is unavailable
    /// </summary>
    public string? Limitation { get; set; }

    public HardwareFieldValue() { }

    public HardwareFieldValue(T? value, string source = "hardware-agent", string confidence = "HIGH", string? limitation = null)
    {
        Value = value;
        Source = source;
        Confidence = confidence;
        Limitation = limitation;
    }
}
