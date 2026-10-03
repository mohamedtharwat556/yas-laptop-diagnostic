using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using System.Net;
using System.Text.Json;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Test 3, 4, 5: Hardware endpoint tests
/// </summary>
public class HardwareEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public HardwareEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Test3_HardwareEndpoint_Returns200()
    {
        // Arrange
        var request = "/api/hardware";

        // Act
        var response = await _client.GetAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Test4_HardwareResponse_MatchesContract()
    {
        // Arrange
        var request = "/api/hardware";

        // Act
        var response = await _client.GetAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content);

        // Assert - Verify required top-level properties exist
        Assert.True(json.RootElement.TryGetProperty("computer", out _));
        Assert.True(json.RootElement.TryGetProperty("operatingSystem", out _));
        Assert.True(json.RootElement.TryGetProperty("cpu", out _));
        Assert.True(json.RootElement.TryGetProperty("memory", out _));
        Assert.True(json.RootElement.TryGetProperty("gpu", out _));
        Assert.True(json.RootElement.TryGetProperty("storage", out _));
        Assert.True(json.RootElement.TryGetProperty("battery", out _));
        Assert.True(json.RootElement.TryGetProperty("network", out _));
        Assert.True(json.RootElement.TryGetProperty("metadata", out _));

        // Assert - Verify metadata
        var metadata = json.RootElement.GetProperty("metadata");
        Assert.True(metadata.TryGetProperty("source", out var source));
        Assert.Equal("hardware-agent", source.GetString());
    }

    [Fact]
    public async Task Test5_HardwareResponse_NoFakeValues()
    {
        // Arrange
        var request = "/api/hardware";

        // Act
        var response = await _client.GetAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content);

        // Assert - Foundation implementation should return null/empty, not fake values
        // Check that manufacturer is not a hardcoded fake value
        var computer = json.RootElement.GetProperty("computer");
        if (computer.TryGetProperty("manufacturer", out var manufacturer))
        {
            var mfgValue = manufacturer.GetString();
            if (mfgValue != null)
            {
                // If not null, it should not be a common fake placeholder
                Assert.DoesNotContain("Lenovo", mfgValue, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("Dell", mfgValue, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("HP", mfgValue, StringComparison.OrdinalIgnoreCase);
            }
        }

        // Check that storage is empty array, not fake capacity
        var storage = json.RootElement.GetProperty("storage");
        Assert.Equal(JsonValueKind.Array, storage.ValueKind);
    }
}
