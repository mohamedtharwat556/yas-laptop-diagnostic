using System.Management;
using Microsoft.Extensions.Logging;

namespace YAS.HardwareAgent.Infrastructure;

/// <summary>
/// Windows hardware information provider using WMI
/// </summary>
public class WindowsHardwareProvider : IWindowsHardwareProvider
{
    private readonly ILogger<WindowsHardwareProvider> _logger;

    public WindowsHardwareProvider(ILogger<WindowsHardwareProvider> logger)
    {
        _logger = logger;
    }

    public async Task<IEnumerable<dynamic>> QueryWmiAsync(string className, string? whereClause = null, CancellationToken cancellationToken = default)
    {
        return await Task.Run(() =>
        {
            var results = new List<dynamic>();

            try
            {
                var query = $"SELECT * FROM {className}";
                if (!string.IsNullOrEmpty(whereClause))
                {
                    query += $" WHERE {whereClause}";
                }

                using var searcher = new ManagementObjectSearcher(query);
                using var collection = searcher.Get();

                foreach (ManagementObject obj in collection)
                {
                    var properties = new Dictionary<string, object?>();
                    foreach (PropertyData prop in obj.Properties)
                    {
                        properties[prop.Name] = prop.Value;
                    }
                    results.Add(properties);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WMI query failed for class: {ClassName}", className);
            }

            return results;
        }, cancellationToken);
    }

    public async Task<IEnumerable<dynamic>> QueryWmiPropertiesAsync(string className, string[] properties, string? whereClause = null, CancellationToken cancellationToken = default)
    {
        return await Task.Run(() =>
        {
            var results = new List<dynamic>();

            try
            {
                var propsList = string.Join(", ", properties);
                var query = $"SELECT {propsList} FROM {className}";
                if (!string.IsNullOrEmpty(whereClause))
                {
                    query += $" WHERE {whereClause}";
                }

                using var searcher = new ManagementObjectSearcher(query);
                using var collection = searcher.Get();

                foreach (ManagementObject obj in collection)
                {
                    var propertyValues = new Dictionary<string, object?>();
                    foreach (var prop in properties)
                    {
                        propertyValues[prop] = obj[prop];
                    }
                    results.Add(propertyValues);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WMI query failed for class: {ClassName}", className);
            }

            return results;
        }, cancellationToken);
    }
}
