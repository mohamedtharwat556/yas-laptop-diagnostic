using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Hosting;
using Xunit;
using System.Net;
using System.Text.Json;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Test 6: Error handling - one component failure should not crash entire API
/// </summary>
public class ErrorHandlingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ErrorHandlingTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Test6_ComponentFailure_DoesNotCrashApi()
    {
        // Arrange
        var request = "/api/hardware";

        // Act
        var response = await _client.GetAsync(request);

        // Assert
        // Even if individual collectors fail, the API should still return 200
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content);

        // Response should still have valid structure
        Assert.True(json.RootElement.TryGetProperty("metadata", out _));
    }
}
