$file = "C:\Users\yas\Downloads\مشاريع ثروت\tast tharwat\js\sessionService.js"
$content = [System.IO.File]::ReadAllText($file)
$newContent = $content -replace 'const sessionService = new SessionService\(\);', 'window.sessionService = new SessionService();'
[System.IO.File]::WriteAllText($file, $newContent)
Write-Host "Fixed sessionService.js - window.sessionService assigned"
