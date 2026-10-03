using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Service for collecting computer information
/// </summary>
public interface IComputerInfoService
{
    Task<ComputerInfo> GetComputerInfoAsync(CancellationToken cancellationToken = default);
}
