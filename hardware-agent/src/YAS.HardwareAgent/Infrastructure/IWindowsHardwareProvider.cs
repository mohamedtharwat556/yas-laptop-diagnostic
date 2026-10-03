namespace YAS.HardwareAgent.Infrastructure;

/// <summary>
/// Abstraction for Windows hardware information access
/// This layer handles WMI, CIM, and Windows Management APIs
/// </summary>
public interface IWindowsHardwareProvider
{
    /// <summary>
    /// Get WMI object query result
    /// </summary>
    Task<IEnumerable<dynamic>> QueryWmiAsync(string className, string? whereClause = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get WMI object query result with specific properties
    /// </summary>
    Task<IEnumerable<dynamic>> QueryWmiPropertiesAsync(string className, string[] properties, string? whereClause = null, CancellationToken cancellationToken = default);
}
