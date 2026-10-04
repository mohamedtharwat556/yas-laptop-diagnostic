using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Interface for collecting motherboard information
/// </summary>
public interface IMotherboardInfoService
{
    Task<MotherboardInfo> GetMotherboardInfoAsync(CancellationToken cancellationToken = default);
}
