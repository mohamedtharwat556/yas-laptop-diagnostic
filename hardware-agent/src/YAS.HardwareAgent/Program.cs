using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using YAS.HardwareAgent.Services;
using YAS.HardwareAgent.Infrastructure;

// Make Program class public for testing
public partial class Program { }

var builder = WebApplication.CreateBuilder(args);

// Add configuration
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services
builder.Services.AddControllers();

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("CORS:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("YASWebApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register hardware services (DI)
builder.Services.AddSingleton<IWindowsHardwareProvider, WindowsHardwareProvider>();
builder.Services.AddScoped<IComputerInfoService, ComputerInfoService>();
builder.Services.AddScoped<IOperatingSystemInfoService, OperatingSystemInfoService>();
builder.Services.AddScoped<ICpuInfoService, CpuInfoService>();
builder.Services.AddScoped<IMemoryInfoService, MemoryInfoService>();
builder.Services.AddScoped<IGpuInfoService, GpuInfoService>();
builder.Services.AddScoped<IStorageInfoService, StorageInfoService>();
builder.Services.AddScoped<IBatteryInfoService, BatteryInfoService>();
builder.Services.AddScoped<INetworkInfoService, NetworkInfoService>();

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors("YASWebApp");

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Get server URL from configuration
var serverUrl = builder.Configuration["Server:Urls"] ?? "http://127.0.0.1:5275";
var logger = app.Services.GetRequiredService<ILogger<Program>>();

logger.LogInformation("YAS Hardware Agent starting...");
logger.LogInformation("Server URL: {ServerUrl}", serverUrl);
logger.LogInformation("Allowed CORS origins: {Origins}", string.Join(", ", allowedOrigins));

app.Run(serverUrl);
