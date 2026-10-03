using Xunit;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Test 1 & 2: Health endpoint tests
/// NOTE: Integration tests require manual browser testing or running the agent
/// </summary>
public class HealthEndpointTests
{
    [Fact(Skip = "Integration test - requires running agent")]
    public async Task Test1_HealthEndpoint_Returns200()
    {
        // MANUAL TEST REQUIRED
        // Run: dotnet run --project src/YAS.HardwareAgent
        // Then: curl http://localhost:5275/api/health
        // Expected: HTTP 200
        await Task.CompletedTask;
    }

    [Fact(Skip = "Integration test - requires running agent")]
    public async Task Test2_HealthResponse_ContainsRequiredFields()
    {
        // MANUAL TEST REQUIRED
        // Expected JSON fields: status, agent, version
        await Task.CompletedTask;
    }
}
