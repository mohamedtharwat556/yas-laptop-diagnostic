using Microsoft.Extensions.Configuration;
using Xunit;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Test 7: Configuration loading
/// </summary>
public class ConfigurationTests
{
    [Fact]
    public void Test7_Configuration_LoadsAgentPort()
    {
        // Arrange
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "src", "YAS.HardwareAgent");
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        // Act
        var port = configuration["Server:Port"];

        // Assert
        Assert.NotNull(port);
        Assert.True(int.TryParse(port, out _));
    }
}
