using System.Management;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting real network adapter information from Windows WMI
/// Uses Win32_NetworkAdapter and Win32_NetworkAdapterConfiguration
/// </summary>
public class NetworkInfoService : INetworkInfoService
{
    private readonly ILogger<NetworkInfoService> _logger;

    public NetworkInfoService(ILogger<NetworkInfoService> logger)
    {
        _logger = logger;
    }

    public async Task<List<NetworkInfo>> GetNetworkInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Collecting network adapter information from Win32_NetworkAdapter");

        var networkList = new List<NetworkInfo>();

        try
        {
            // Query network adapters
            var adapterQuery = "SELECT Name, Description, Manufacturer, MACAddress, Speed, NetConnectionStatus, AdapterType, ServiceName, NetEnabled FROM Win32_NetworkAdapter WHERE (AdapterType != '' AND AdapterType != NULL)";
            
            var scope = new ManagementScope("\\\\.\\root\\cimv2");
            scope.Connect();

            var query = new ObjectQuery(adapterQuery);
            var searcher = new ManagementObjectSearcher(scope, query);

            // Dictionary to store adapter info by Index for later IP lookup
            var adaptersByIndex = new Dictionary<uint, NetworkInfo>();

            foreach (ManagementObject adapter in searcher.Get())
            {
                try
                {
                    var network = new NetworkInfo();

                    network.Name = adapter["Name"]?.ToString();
                    network.Description = adapter["Description"]?.ToString();
                    network.Manufacturer = adapter["Manufacturer"]?.ToString();
                    network.MACAddress = adapter["MACAddress"]?.ToString();
                    network.AdapterType = adapter["AdapterType"]?.ToString();
                    network.ServiceName = adapter["ServiceName"]?.ToString();

                    // Parse enabled status
                    if (bool.TryParse(adapter["NetEnabled"]?.ToString(), out bool enabled))
                    {
                        network.Enabled = enabled;
                    }

                    // Parse connection status
                    if (int.TryParse(adapter["NetConnectionStatus"]?.ToString(), out int statusCode))
                    {
                        network.Status = ParseNetworkStatus(statusCode);
                        network.Connected = statusCode == 2; // 2 = Connected
                    }

                    // Parse speed (in bits per second, convert to Mbps)
                    if (long.TryParse(adapter["Speed"]?.ToString(), out long speedBps))
                    {
                        if (speedBps > 0)
                        {
                            long speedMbps = speedBps / 1_000_000;
                            network.Speed = speedMbps > 1000 ? $"{Math.Round(speedMbps / 1000.0, 1)} Gbps" : $"{speedMbps} Mbps";
                        }
                    }

                    // Determine adapter type
                    network.Type = DetermineAdapterType(network.Description, network.AdapterType);

                    // Store for IP address lookup
                    if (uint.TryParse(adapter["Index"]?.ToString(), out uint index))
                    {
                        adaptersByIndex[index] = network;
                    }

                    networkList.Add(network);
                    _logger.LogInformation("Network adapter collected: {Name} - {Type} - {Status}", 
                        network.Name, network.Type, network.Status);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing network adapter information");
                }
            }

            // Now get IP addresses
            try
            {
                var configQuery = "SELECT InterfaceIndex, IPAddress, IPv6Address FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True";
                query = new ObjectQuery(configQuery);
                searcher = new ManagementObjectSearcher(scope, query);

                foreach (ManagementObject config in searcher.Get())
                {
                    try
                    {
                        if (uint.TryParse(config["InterfaceIndex"]?.ToString(), out uint index) &&
                            adaptersByIndex.TryGetValue(index, out var network))
                        {
                            // Parse IPv4 addresses
                            var ipAddressArray = config["IPAddress"];
                            if (ipAddressArray != null && ipAddressArray is System.Collections.IEnumerable)
                            {
                                network.IPAddresses = new List<string>();
                                foreach (var ip in (System.Collections.IEnumerable)ipAddressArray)
                                {
                                    network.IPAddresses.Add(ip?.ToString() ?? "");
                                }
                            }

                            // Parse IPv6 addresses
                            var ipv6AddressArray = config["IPv6Address"];
                            if (ipv6AddressArray != null && ipv6AddressArray is System.Collections.IEnumerable)
                            {
                                network.IPv6Addresses = new List<string>();
                                foreach (var ipv6 in (System.Collections.IEnumerable)ipv6AddressArray)
                                {
                                    network.IPv6Addresses.Add(ipv6?.ToString() ?? "");
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error parsing network adapter configuration");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error collecting network adapter configuration");
            }

            if (networkList.Count == 0)
            {
                _logger.LogWarning("No network adapters found");
            }

            return await Task.FromResult(networkList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting network information");
            return await Task.FromResult(new List<NetworkInfo>());
        }
    }

    /// <summary>
    /// Parse network connection status code
    /// </summary>
    private string ParseNetworkStatus(int statusCode)
    {
        return statusCode switch
        {
            0 => "Disconnected",
            1 => "Connecting",
            2 => "Connected",
            3 => "Disconnecting",
            4 => "Hardware Not Present",
            5 => "Hardware Disabled",
            6 => "Hardware Malfunction",
            _ => "Unknown"
        };
    }

    /// <summary>
    /// Determine adapter type (Ethernet, Wi-Fi, Bluetooth, etc.)
    /// </summary>
    private string DetermineAdapterType(string? description, string? adapterType)
    {
        string combined = (description ?? "") + (adapterType ?? "");
        combined = combined.ToLower();

        if (combined.Contains("wireless") || combined.Contains("802.11") || combined.Contains("wi-fi"))
            return "Wi-Fi";
        if (combined.Contains("bluetooth"))
            return "Bluetooth";
        if (combined.Contains("ethernet") || combined.Contains("gigabit") || combined.Contains("lan"))
            return "Ethernet";
        if (combined.Contains("pppp") || combined.Contains("dial-up"))
            return "Dial-up";
        if (combined.Contains("vpn") || combined.Contains("tap") || combined.Contains("tun"))
            return "VPN";

        return adapterType ?? "Other";
    }
}
