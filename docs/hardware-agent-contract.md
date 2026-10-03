# YAS Hardware Agent - API Contract

## Overview
The YAS Hardware Agent is a Windows desktop application that provides real hardware information to the YAS Laptop Diagnostic Web Application via local HTTP API.

## Architecture
```
YAS Laptop Diagnostic Web App
            │
            │ HTTP (localhost)
            ▼
YAS Hardware Agent (Windows)
            │
            ├── WMI/CIM Queries
            ├── Windows APIs
            └── Hardware Detection
```

## Endpoints

### 1. Health Check
**Endpoint:** `GET /api/health`

**Purpose:** Verify agent is running and responsive

**Response:**
```json
{
  "status": "ok",
  "agent": "YAS Hardware Agent",
  "version": "1.0.0"
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Agent not responding"
}
```

### 2. Hardware Information
**Endpoint:** `GET /api/hardware`

**Purpose:** Get complete hardware information

**Response:**
```json
{
  "agent": {
    "name": "YAS Hardware Agent",
    "version": "1.0.0",
    "connected": true
  },

  "computer": {
    "manufacturer": "Lenovo",
    "model": "ThinkPad T480",
    "deviceType": "Laptop",
    "serialNumber": "PC123456789"
  },

  "operatingSystem": {
    "name": "Windows 11 Pro",
    "version": "10.0.22621",
    "build": "22621"
  },

  "cpu": {
    "name": "Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz",
    "manufacturer": "Intel",
    "cores": 4,
    "logicalProcessors": 8,
    "maxClockMHz": 1600
  },

  "memory": {
    "totalBytes": 17179869184,
    "totalGB": 16,
    "modules": [
      {
        "capacityBytes": 8589934592,
        "capacityGB": 8,
        "manufacturer": "Samsung",
        "speedMHz": 2666,
        "type": "DDR4"
      },
      {
        "capacityBytes": 8589934592,
        "capacityGB": 8,
        "manufacturer": "Samsung",
        "speedMHz": 2666,
        "type": "DDR4"
      }
    ]
  },

  "gpu": [
    {
      "name": "Intel(R) UHD Graphics 620",
      "manufacturer": "Intel",
      "driverVersion": "30.0.101.1404",
      "adapterRamBytes": null
    }
  ],

  "storage": [
    {
      "model": "Samsung SSD 970 EVO 500GB",
      "deviceID": "\\Device\\HarddiskVolume1",
      "type": "SSD",
      "interface": "NVMe",
      "capacityBytes": 512110190592,
      "capacityGB": 512,
      "usedBytes": 180000000000,
      "freeBytes": 332110190592,
      "systemDrive": true,
      "partitions": [
        {
          "letter": "C:",
          "label": "OS",
          "capacityBytes": 512110190592,
          "usedBytes": 180000000000,
          "freeBytes": 332110190592
        }
      ]
    }
  ],

  "battery": {
    "present": true,
    "percentage": 85,
    "charging": false,
    "designCapacityWh": 48,
    "fullChargeCapacityWh": 45,
    "cycleCount": 250
  },

  "network": [
    {
      "name": "Intel(R) Ethernet Connection (6) I219-V",
      "type": "Ethernet",
      "connected": false,
      "linkSpeedMbps": null
    },
    {
      "name": "Intel(R) Dual Band Wireless-AC 8265",
      "type": "WiFi",
      "connected": true,
      "linkSpeedMbps": 866
    }
  ],

  "motherboard": {
    "manufacturer": "Lenovo",
    "product": "20L70020US",
    "bios": {
      "manufacturer": "Lenovo",
      "version": "1.42",
      "serialNumber": "PC123456789"
    }
  },

  "metadata": {
    "source": "hardware-agent",
    "capturedAt": "2026-10-03T13:25:41.000Z"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Failed to retrieve hardware information",
  "details": "WMI query failed for Win32_ComputerSystem"
}
```

## Field Specifications

### agent
- `name`: Agent name (string)
- `version`: Agent version (string, semver)
- `connected`: Connection status (boolean)

### computer
- `manufacturer`: Device manufacturer (string, nullable)
- `model`: Device model (string, nullable)
- `deviceType`: Device type (string: "Laptop", "Desktop", "Tablet", "Unknown")
- `serialNumber`: Serial number (string, nullable) - should be optional/configurable

### operatingSystem
- `name`: OS name (string, nullable)
- `version`: OS version (string, nullable)
- `build`: OS build number (string, nullable)

### cpu
- `name`: CPU name (string, nullable)
- `manufacturer`: CPU manufacturer (string, nullable)
- `cores`: Physical cores (integer, nullable)
- `logicalProcessors`: Logical processors (integer, nullable)
- `maxClockMHz`: Max clock speed in MHz (integer, nullable)

### memory
- `totalBytes`: Total RAM in bytes (integer, nullable)
- `totalGB`: Total RAM in GB (integer, nullable)
- `modules`: Array of RAM modules (array, nullable)
  - `capacityBytes`: Module capacity in bytes (integer, nullable)
  - `capacityGB`: Module capacity in GB (integer, nullable)
  - `manufacturer`: Module manufacturer (string, nullable)
  - `speedMHz`: Module speed in MHz (integer, nullable)
  - `type`: Memory type (string, nullable)

### gpu
Array of GPU objects:
- `name`: GPU name (string, nullable)
- `manufacturer`: GPU manufacturer (string, nullable)
- `driverVersion`: Driver version (string, nullable)
- `adapterRamBytes`: VRAM in bytes (integer, nullable)

### storage
Array of storage devices:
- `model`: Disk model (string, nullable)
- `deviceID`: Windows device ID (string, nullable)
- `type`: Disk type (string: "SSD", "HDD", "NVMe", "Unknown")
- `interface`: Disk interface (string: "NVMe", "SATA", "SAS", "Unknown")
- `capacityBytes`: Total capacity in bytes (integer, nullable)
- `capacityGB`: Total capacity in GB (integer, nullable)
- `usedBytes`: Used space in bytes (integer, nullable)
- `freeBytes`: Free space in bytes (integer, nullable)
- `systemDrive`: Is this the system drive (boolean)
- `partitions`: Array of partitions (array, nullable)
  - `letter`: Drive letter (string, nullable)
  - `label`: Volume label (string, nullable)
  - `capacityBytes`: Partition capacity in bytes (integer, nullable)
  - `usedBytes`: Partition used space in bytes (integer, nullable)
  - `freeBytes`: Partition free space in bytes (integer, nullable)

### battery
- `present`: Battery present (boolean, nullable)
- `percentage`: Charge percentage (integer, 0-100, nullable)
- `charging`: Is charging (boolean, nullable)
- `designCapacityWh`: Design capacity in Wh (number, nullable)
- `fullChargeCapacityWh`: Full charge capacity in Wh (number, nullable)
- `cycleCount`: Battery cycle count (integer, nullable)

### network
Array of network adapters:
- `name`: Adapter name (string, nullable)
- `type`: Adapter type (string: "Ethernet", "WiFi", "Bluetooth", "Unknown")
- `connected`: Is connected (boolean, nullable)
- `linkSpeedMbps`: Link speed in Mbps (integer, nullable)

### motherboard
- `manufacturer`: Manufacturer (string, nullable)
- `product`: Product name (string, nullable)
- `bios`: BIOS information (object, nullable)
  - `manufacturer`: BIOS manufacturer (string, nullable)
  - `version`: BIOS version (string, nullable)
  - `serialNumber`: BIOS serial number (string, nullable)

### metadata
- `source`: Data source (string: "hardware-agent")
- `capturedAt`: ISO 8601 timestamp (string, nullable)

## Security Requirements

1. **Read-Only Only**: Agent must not execute any commands from the web app
2. **No Arbitrary Execution**: Web app can only request `/api/health` and `/api/hardware`
3. **No File Access**: Agent must not return any file contents or user files
4. **No Sensitive Data**: Agent must not return passwords, browser history, or personal files
5. **Localhost Only**: Agent should only accept connections from localhost
6. **CORS Control**: Configure CORS to only allow the web app origin

## WMI Classes Reference

### Computer Information
- `Win32_ComputerSystem`: Manufacturer, Model, SystemType
- `Win32_BIOS`: SerialNumber, Version
- `Win32_OperatingSystem`: Name, Version, Build

### CPU
- `Win32_Processor`: Name, Manufacturer, NumberOfCores, MaxClockSpeed

### Memory
- `Win32_PhysicalMemory`: Capacity, Manufacturer, Speed, ConfiguredClockSpeed

### GPU
- `Win32_VideoController`: Name, DriverVersion, AdapterRAM

### Storage
- `Win32_DiskDrive`: Model, Size, InterfaceType
- `Win32_LogicalDisk`: Size, FreeSpace, DeviceID
- `Win32_DiskPartition`: Size, PrimaryPartition

### Battery
- `Win32_Battery`: EstimatedChargeRemaining, BatteryStatus, DesignCapacity

### Network
- `Win32_NetworkAdapter`: Name, AdapterType, NetConnectionStatus

## Error Handling

Agent should return partial results if some WMI queries fail:
- Return available fields as `null` if not accessible
- Include error details in response for debugging
- Never crash or return 500 error for partial data

## Port Configuration

Default Port: **TBD** (to be configured)
Development Port: **TBD** (for development only)

Port should be configurable via:
- Configuration file
- Command line argument
- Registry setting

## Version History

- **1.0.0**: Initial specification
