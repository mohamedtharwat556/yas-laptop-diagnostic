$installPath = "C:\Program Files\YAS Hardware Agent"
$exePath = "$installPath\YAS.HardwareAgent.exe"
$sourcePath = "C:\Users\yas\Downloads\مشاريع ثروت\tast tharwat\hardware-agent\publish"

Write-Host "Source: $sourcePath"
Write-Host "Destination: $installPath"

if (-not (Test-Path $sourcePath)) {
    Write-Host "Source not found!"
    exit 1
}

if (-not (Test-Path $installPath)) {
    mkdir $installPath
    Write-Host "Created $installPath"
}

Copy-Item "$sourcePath\*" $installPath -Recurse -Force
Write-Host "Copied files"

$exe = Get-ChildItem "$installPath\*.exe" | Select-Object -First 1
if ($exe) {
    Write-Host "Executable found: $($exe.FullName)"
} else {
    Write-Host "Executable NOT found!"
    Get-ChildItem $installPath | Select-Object Name | Format-Table
}
