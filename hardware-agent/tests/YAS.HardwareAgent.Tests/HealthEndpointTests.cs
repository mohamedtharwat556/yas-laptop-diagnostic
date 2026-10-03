using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Hosting;
using Xunit;
using System.Net;
using System.Text.Json;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Custom WebApplicationFactory for testing
/// </summary>
public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Override services for testing if needed
        });
    }
}

/// <summary>
/// Test 1 & 2: Health endpoint tests
/// </summary>
public class HealthEndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public HealthEndpointTests(TestWebApplicationFactory factory)
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
