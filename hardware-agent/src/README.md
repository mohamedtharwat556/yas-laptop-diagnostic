# YAS Hardware Agent - Source Code

This directory will contain the C# source code for the YAS Hardware Agent.

## Project Structure

```
src/
├── YasHardwareAgent/
│   ├── Program.cs
│   ├── Controllers/
│   │   ├── HealthController.cs
│   │   └── HardwareController.cs
│   ├── Models/
│   │   ├── HardwareResponse.cs
│   │   ├── ComputerInfo.cs
│   │   ├── CpuInfo.cs
│   │   ├── MemoryInfo.cs
│   │   ├── GpuInfo.cs
│   │   ├── StorageInfo.cs
│   │   ├── BatteryInfo.cs
│   │   └── NetworkInfo.cs
│   ├── Services/
│   │   ├── WmiService.cs
│   │   └── HardwareDetectionService.cs
│   └── YasHardwareAgent.csproj
```

## Implementation Requirements

### Controllers
- `HealthController`: GET /api/health endpoint
- `HardwareController`: GET /api/hardware endpoint

### Services
- `WmiService`: Wrapper for WMI queries
- `HardwareDetectionService`: Orchestrate hardware detection

### Models
- Data models matching the API contract in ../docs/hardware-agent-contract.md

## WMI Classes to Query

- `Win32_ComputerSystem`: Manufacturer, Model
- `Win32_BIOS`: SerialNumber, Version
- `Win32_OperatingSystem`: Name, Version, Build
- `Win32_Processor`: CPU details
- `Win32_PhysicalMemory`: RAM modules
- `Win32_VideoController`: GPU
- `Win32_DiskDrive`: Storage
- `Win32_LogicalDisk`: Partitions
- `Win32_Battery`: Battery
- `Win32_NetworkAdapter`: Network

## Status

**NOT YET IMPLEMENTED**

This is a placeholder for future C# development in a Windows environment with Visual Studio and .NET SDK.
