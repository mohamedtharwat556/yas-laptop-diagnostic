$uri = "http://127.0.0.1:5275/api/hardware"
$request = [System.Net.HttpWebRequest]::Create($uri)
$response = $request.GetResponse()
$stream = $response.GetResponseStream()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$response.Close()

Write-Host "=== API /hardware Response ===" -ForegroundColor Cyan
Write-Host $content

# Parse and display
$json = $content | ConvertFrom-Json
Write-Host "`n=== Parsed JSON ===" -ForegroundColor Green
$json | ConvertTo-Json -Depth 10
