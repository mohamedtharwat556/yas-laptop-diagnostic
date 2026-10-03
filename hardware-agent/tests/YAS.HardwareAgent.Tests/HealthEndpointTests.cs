using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Hosting;
using Xunit;
using System.Net;
using System.Text.Json;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Test 1 & 2: Health endpoint tests
/// </summary>
public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Test1_HealthEndpoint_Returns200()
    {
        // Arrange
        var request = "/api/health";

        // Act
        var response = await _client.GetAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Test2_HealthResponse_ContainsRequiredFields()
    {
        // Arrange
        var request = "/api/health";

        // Act
        var response = await _client.GetAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content);

        // Assert
        Assert.True(json.RootElement.TryGetProperty("status", out var status));
        Assert.True(json.RootElement.TryGetProperty("agent", out var agent));
        Assert.True(json.RootElement.TryGetProperty("version", out var version));

        Assert.Equal("ok", status.GetString());
        Assert.NotNull(agent.GetString());
        Assert.NotNull(version.GetString());
    }
}
