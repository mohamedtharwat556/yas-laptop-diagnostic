using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Models;
using YAS.HardwareAgent.Services;

namespace YAS.HardwareAgent.Controllers;

/// <summary>
/// Hardware information endpoint
/// </summary>
[ApiController]
[Route("api")]
public class HardwareController : ControllerBase
{
    private readonly ILogger<HardwareController> _logger;
    private readonly IComputerInfoService _computerInfoService;
    private readonly IOperatingSystemInfoService _operatingSystemInfoService;
    private readonly ICpuInfoService _cpuInfoService;
    private readonly IMemoryInfoService _memoryInfoService;
    private readonly IGpuInfoService _gpuInfoService;
    private readonly IStorageInfoService _storageInfoService;
    private readonly IBatteryInfoService _batteryInfoService;
    private readonly INetworkInfoService _networkInfoService;
    private readonly IMotherboardInfoService _motherboardInfoService;
    private readonly IBiosInfoService _biosInfoService;

    public HardwareController(
        ILogger<HardwareController> logger,
        IComputerInfoService computerInfoService,
        IOperatingSystemInfoService operatingSystemInfoService,
        ICpuInfoService cpuInfoService,
        IMemoryInfoService memoryInfoService,
        IGpuInfoService gpuInfoService,
        IStorageInfoService storageInfoService,
        IBatteryInfoService batteryInfoService,
        INetworkInfoService networkInfoService,
        IMotherboardInfoService motherboardInfoService,
        IBiosInfoService biosInfoService)
    {
        _logger = logger;
        _computerInfoService = computerInfoService;
        _operatingSystemInfoService = operatingSystemInfoService;
        _cpuInfoService = cpuInfoService;
        _memoryInfoService = memoryInfoService;
        _gpuInfoService = gpuInfoService;
        _storageInfoService = storageInfoService;
        _batteryInfoService = batteryInfoService;
        _networkInfoService = networkInfoService;
        _motherboardInfoService = motherboardInfoService;
        _biosInfoService = biosInfoService;
    }

    /// <summary>
    /// GET /api/hardware
    /// Get complete hardware information
    /// </summary>
    [HttpGet("hardware")]
    public async Task<ActionResult<HardwareResponse>> GetHardware(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Hardware information requested");

        var response = new HardwareResponse();

        // Collect information from all services
        // Each service is wrapped in try-catch to prevent one failure from crashing the entire API
        try
        {
            response.Computer = await _computerInfoService.GetComputerInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect computer information");
        }

        try
        {
            response.OperatingSystem = await _operatingSystemInfoService.GetOperatingSystemInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect operating system information");
        }

        try
        {
            response.Cpu = await _cpuInfoService.GetCpuInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect CPU information");
        }

        try
        {
            response.Memory = await _memoryInfoService.GetMemoryInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect memory information");
        }

        try
        {
            response.Gpu = await _gpuInfoService.GetGpuInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect GPU information");
        }

        try
        {
            response.Storage = await _storageInfoService.GetStorageInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect storage information");
        }

        try
        {
            response.Battery = await _batteryInfoService.GetBatteryInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect battery information");
        }

        try
        {
            response.Network = await _networkInfoService.GetNetworkInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect network information");
        }

        try
        {
            response.Motherboard = await _motherboardInfoService.GetMotherboardInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect motherboard information");
        }

        try
        {
            response.Bios = await _biosInfoService.GetBiosInfoAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect BIOS information");
        }

        response.Metadata = new HardwareMetadata
        {
            Source = "hardware-agent",
            CapturedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Hardware information collected successfully");

        return Ok(response);
    }

    /// <summary>
    /// GET /api/hardware/normalized
    /// Get complete hardware information with source and confidence tracking
    /// This endpoint returns the same data as /api/hardware but with metadata
    /// </summary>
    [HttpGet("hardware/normalized")]
    public async Task<ActionResult<NormalizedHardwareResponse>> GetHardwareNormalized(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Normalized hardware information requested");

        // Get raw hardware response
        var hardwareResult = await GetHardware(cancellationToken);
        if (hardwareResult.Value == null)
        {
            return Ok(new NormalizedHardwareResponse());
        }

        // Normalize the response
        var normalized = HardwareNormalizerService.Normalize(hardwareResult.Value);

        _logger.LogInformation("Hardware information normalized successfully");

        return Ok(normalized);
    }
}
