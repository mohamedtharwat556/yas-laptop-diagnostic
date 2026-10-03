using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Controllers;

/// <summary>
/// Health check endpoint
/// </summary>
[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;
    private readonly IConfiguration _configuration;

    public HealthController(ILogger<HealthController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// GET /api/health
    /// Check if agent is running
    /// </summary>
    [HttpGet("health")]
    public ActionResult<AgentInfo> GetHealth()
    {
        _logger.LogInformation("Health check requested");

        var agentName = _configuration["Agent:Name"] ?? "YAS Hardware Agent";
        var version = _configuration["Agent:Version"] ?? "1.0.0";

        return Ok(new AgentInfo
        {
            Status = "ok",
            Agent = agentName,
            Version = version,
            Timestamp = DateTime.UtcNow
        });
    }
}
