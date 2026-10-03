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
- **Target Framework**: .NET 6 or later
- **Platform**: Windows 10/11
- **Communication**: HTTP API (localhost)
- **Hardware Detection**: WMI (Windows Management Instrumentation)

## Requirements

- Windows 10 or Windows 11
- .NET 6 Runtime or SDK
- Administrator privileges not required for basic hardware reading

## Architecture

```
Web Browser (localhost)
    ↓ HTTP
YAS Hardware Agent (Windows)
    ↓ WMI/CIM
Windows Hardware APIs
```

## API Endpoints

### GET /api/health
Check if agent is running.

### GET /api/hardware
Get complete hardware information.

See [API Contract](../docs/hardware-agent-contract.md) for detailed specifications.

## Installation

### Development
```bash
dotnet run --project src/YasHardwareAgent
```

### Production
Build and distribute as standalone executable or installer.

## Configuration

The agent uses a configurable port (TBD) for HTTP communication.

## Security

- Read-only hardware information only
- No arbitrary command execution
- Localhost-only communication
- No file access or user data collection
- No sensitive information exposure

## Future Development

This folder contains the specification and skeleton for the Windows agent implementation. The actual C# code will be developed in a Windows development environment with Visual Studio and .NET SDK.

## Important Notes

- This agent is NOT yet built or tested
- Current implementation is web-side integration only
- Requires Windows development environment to build
- Cannot be tested in current web-only environment
