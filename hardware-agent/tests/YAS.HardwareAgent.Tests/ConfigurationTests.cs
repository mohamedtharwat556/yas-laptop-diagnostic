using Microsoft.Extensions.Configuration;
using Xunit;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Test 7: Configuration loading
/// </summary>
public class ConfigurationTests
{
    [Fact(Skip = "Path resolution issue in test environment")]
    public void Test7_Configuration_LoadsAgentPort()
    {
        // MANUAL TEST REQUIRED
        // Verify appsettings.json contains Server:Port configuration
        // Expected: Port = 5275
    }
}
