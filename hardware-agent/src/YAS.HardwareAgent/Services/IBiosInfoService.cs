using YAS.HardwareAgent.Models;

namespace YAS.HardwareAgent.Services;

/// <summary>
/// Interface for collecting BIOS information
/// </summary>
public interface IBiosInfoService
{
    Task<BiosInfo> GetBiosInfoAsync(CancellationToken cancellationToken = default);
}
