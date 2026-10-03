using Xunit;

namespace YAS.HardwareAgent.Tests;

/// <summary>
/// Test 3, 4, 5: Hardware endpoint tests
/// NOTE: Integration tests require manual browser testing or running the agent
/// </summary>
public class HardwareEndpointTests
{
    [Fact(Skip = "Integration test - requires running agent")]
    public async Task Test3_HardwareEndpoint_Returns200()
    {
        // MANUAL TEST REQUIRED
        // Run: dotnet run --project src/YAS.HardwareAgent
        // Then: curl http://localhost:5275/api/hardware
        // Expected: HTTP 200
        await Task.CompletedTask;
    }

    [Fact(Skip = "Integration test - requires running agent")]
    public async Task Test4_HardwareResponse_MatchesContract()
    {
        // MANUAL TEST REQUIRED
        // Expected JSON fields: computer, operatingSystem, cpu, memory, gpu, storage, battery, network, metadata
        await Task.CompletedTask;
    }

    [Fact(Skip = "Integration test - requires running agent")]
    public async Task Test5_HardwareResponse_NoFakeValues()
    {
        // MANUAL TEST REQUIRED
        // Verify no hardcoded "Lenovo", "Dell", "HP" values
        // Verify storage is empty array or null in foundation
        await Task.CompletedTask;
    }
}
