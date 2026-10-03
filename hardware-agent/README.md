# YAS Hardware Agent

YAS Hardware Agent is a Windows desktop application that provides real hardware information to the YAS Laptop Diagnostic Web Application.

## Purpose

Web browsers have significant limitations in detecting real hardware information due to privacy restrictions. This agent bridges that gap by:

- Reading actual hardware specifications from Windows
- Providing real disk capacity and usage
- Detecting manufacturer and model information
- Reading CPU, GPU, RAM, and battery details
- Serving this information via local HTTP API

## Technology Stack

- **Language**: C# / .NET
- **Target Framework**: .NET 8.0
- **Platform**: Windows 10/11
- **Communication**: HTTP API (localhost)
- **Hardware Detection**: WMI (Windows Management Instrumentation)
- **API**: ASP.NET Core Minimal API

## Requirements

- Windows 10 or Windows 11
- .NET 8.0 SDK (for development)
- .NET 8.0 Runtime (for running)
- Administrator privileges not required for basic hardware reading

## Installation

### Prerequisites

1. Install .NET 8.0 SDK from https://dotnet.microsoft.com/download

2. Verify installation:
```bash
dotnet --version
```

### Build from Source

```bash
# Navigate to hardware-agent directory
cd hardware-agent

# Restore dependencies
dotnet restore

# Build the solution
dotnet build

# Run tests
dotnet test

# Run the agent
dotnet run --project src/YAS.HardwareAgent
```

### Production Build

```bash
# Publish as standalone executable
dotnet publish src/YAS.HardwareAgent -c Release -r win-x64 --self-contained
```

## Architecture

```
Web Browser (localhost:3000 or Vercel)
    ↓ HTTP API
YAS Hardware Agent (localhost:5275)
    ↓ WMI/CIM
Windows Hardware APIs
```

### Project Structure

```
hardware-agent/
├── YASHardwareAgent.sln           # Solution file
├── README.md                      # This file
├── src/
│   └── YAS.HardwareAgent/
│       ├── YAS.HardwareAgent.csproj
│       ├── Program.cs             # Application entry point
│       ├── appsettings.json       # Configuration
│       ├── Controllers/           # API endpoints
│       │   ├── HealthController.cs
│       │   └── HardwareController.cs
│       ├── Services/              # Hardware collection services
│       │   ├── IComputerInfoService.cs
│       │   ├── ComputerInfoService.cs
│       │   ├── IOperatingSystemInfoService.cs
│       │   ├── OperatingSystemInfoService.cs
│       │   ├── ICpuInfoService.cs
│       │   ├── CpuInfoService.cs
│       │   ├── IMemoryInfoService.cs
│       │   ├── MemoryInfoService.cs
│       │   ├── IGpuInfoService.cs
│       │   ├── GpuInfoService.cs
│       │   ├── IStorageInfoService.cs
│       │   ├── StorageInfoService.cs
│       │   ├── IBatteryInfoService.cs
│       │   ├── BatteryInfoService.cs
│       │   ├── INetworkInfoService.cs
│       │   └── NetworkInfoService.cs
│       ├── Models/                # Data models
│       │   ├── AgentInfo.cs
│       │   ├── HardwareResponse.cs
│       │   ├── ComputerInfo.cs
│       │   ├── OperatingSystemInfo.cs
│       │   ├── CpuInfo.cs
│       │   ├── MemoryInfo.cs
│       │   ├── GpuInfo.cs
│       │   ├── StorageInfo.cs
│       │   ├── BatteryInfo.cs
│       │   ├── NetworkInfo.cs
│       │   └── HardwareMetadata.cs
│       └── Infrastructure/        # Windows hardware abstraction
│           ├── IWindowsHardwareProvider.cs
│           └── WindowsHardwareProvider.cs
└── tests/
    └── YAS.HardwareAgent.Tests/
        ├── YAS.HardwareAgent.Tests.csproj
        ├── HealthEndpointTests.cs
        ├── HardwareEndpointTests.cs
        ├── ErrorHandlingTests.cs
        └── ConfigurationTests.cs
```

## API Endpoints

### GET /api/health

Check if agent is running.

**Response:**
```json
{
  "status": "ok",
  "agent": "YAS Hardware Agent",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl http://localhost:5275/api/health
```

### GET /api/hardware

Get complete hardware information.

**Response:**
```json
{
  "computer": {
    "manufacturer": null,
    "model": null,
    "deviceType": null,
    "serialNumber": null
  },
  "operatingSystem": {
    "name": null,
    "version": null,
    "build": null
  },
  "cpu": {
    "name": null,
    "manufacturer": null,
    "cores": null,
    "logicalProcessors": null,
    "maxClockMHz": null
  },
  "memory": {
    "totalBytes": null,
    "totalGB": null,
    "modules": []
  },
  "gpu": [],
  "storage": [],
  "battery": {
    "present": null,
    "percentage": null,
    "charging": null,
    "designCapacityWh": null,
    "fullChargeCapacityWh": null,
    "cycleCount": null
  },
  "network": [],
  "metadata": {
    "source": "hardware-agent",
    "capturedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Note:** Foundation implementation returns null/empty values. Real hardware collection will be implemented in later batches.

**Example:**
```bash
curl http://localhost:5275/api/hardware
```

## Configuration

### Server Configuration

Default server URL: `http://127.0.0.1:5275`

Edit `src/YAS.HardwareAgent/appsettings.json`:

```json
{
  "Server": {
    "Urls": "http://127.0.0.1:5275",
    "Port": 5275
  }
}
```

### CORS Configuration

Allowed origins are configured in `appsettings.json`:

```json
{
  "CORS": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://yas-laptop-diagnostic.vercel.app"
    ]
  }
}
```

### Logging Configuration

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "YAS.HardwareAgent": "Debug"
    }
  }
}
```

## Security

The agent follows strict security principles:

- **Localhost-only binding**: Only listens on 127.0.0.1, not publicly
- **Read-only**: No write operations or modifications
- **No arbitrary command execution**: PowerShell and CMD are not exposed
- **No file access**: No file browsing, upload, or download endpoints
- **No arbitrary WMI queries**: Only predefined hardware queries
- **No authentication exposure**: No user credentials or Supabase keys
- **CORS-restricted**: Only specific allowed origins can access the API

## Offline Behavior

The agent is designed to work completely offline:

- No internet connection required
- No Supabase dependency
- Hardware collection is local-first
- Data is served directly to the web application

The web application can queue/store results and synchronize with Supabase later.

## Web App Integration

The YAS Web Diagnostic System communicates with the agent:

1. Web app calls `GET http://localhost:5275/api/health` to check if agent is available
2. If agent is available, web app calls `GET http://localhost:5275/api/hardware` to get hardware information
3. If agent is unavailable, web app falls back to browser detection
4. All communication is HTTP JSON

The web app's Hardware Agent client is configured to use port 5275 (configurable in both).

## Development Status

### Foundation (BATCH 6B-1) - COMPLETE
- ✅ Project structure created
- ✅ API endpoints implemented
- ✅ Service architecture established
- ✅ Data models defined
- ✅ Windows hardware abstraction layer created
- ✅ Dependency injection configured
- ✅ CORS configuration
- ✅ Security restrictions implemented
- ✅ Test project created
- ✅ Documentation complete

### NOT YET IMPLEMENTED (Future Batches)
- ❌ Real CPU collector via WMI
- ❌ Real RAM collector via WMI
- ❌ Real GPU collector via WMI
- ❌ Real physical disk collector via WMI
- ❌ Real battery collector via WMI
- ❌ Real network collector via WMI
- ❌ Windows installer
- ❌ Windows service
- ❌ Auto-start configuration
- ❌ Code signing
- ❌ Auto-update mechanism

## Testing

Run all tests:
```bash
dotnet test
```

Run specific test:
```bash
dotnet test --filter "FullyQualifiedName~Test1"
```

### Test Coverage

- **Test 1**: Health endpoint returns HTTP 200
- **Test 2**: Health response contains required fields (status, agent, version)
- **Test 3**: Hardware endpoint returns HTTP 200
- **Test 4**: Hardware response matches JSON contract
- **Test 5**: Hardware endpoint does not return fake/random values
- **Test 6**: One component failure does not crash entire API
- **Test 7**: Configuration can load the Agent port

## Troubleshooting

### Port Already in Use

If port 5275 is already in use, change it in `appsettings.json`:

```json
{
  "Server": {
    "Urls": "http://127.0.0.1:5276",
    "Port": 5276
  }
}
```

### WMI Access Denied

If you get WMI access errors, ensure:
- You are running on Windows
- No antivirus is blocking WMI queries
- Windows Management Instrumentation service is running

### CORS Errors

If web app cannot connect, check:
- Web app origin is in `AllowedOrigins` list
- Agent is running on correct port
- Web app is not using HTTPS when agent expects HTTP (or vice versa)

## Future Development

This foundation provides the architecture for implementing real hardware collectors in future batches. Each service will use the `IWindowsHardwareProvider` to query WMI classes:

- `Win32_ComputerSystem` for computer information
- `Win32_OperatingSystem` for OS information
- `Win32_Processor` for CPU information
- `Win32_PhysicalMemory` for RAM information
- `Win32_VideoController` for GPU information
- `Win32_DiskDrive` and `Win32_LogicalDisk` for storage
- `Win32_Battery` for battery information
- `Win32_NetworkAdapter` for network information

## License

This is part of the YAS Laptop Diagnostic System project.
