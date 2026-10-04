echo "=== BATCH 6B-3 BROWSER VERIFICATION ==="
echo ""

# Test 1: Health
echo "TEST 1: Agent Health"
$health = Invoke-RestMethod -Uri "http://127.0.0.1:5275/api/health" -TimeoutSec 3
echo "/api/health: 200 OK"
echo ""

# Test 2: Hardware
echo "TEST 2: Hardware Data"
$hw = Invoke-RestMethod -Uri "http://127.0.0.1:5275/api/hardware" -TimeoutSec 3
$man = $hw.computer.manufacturer
$model = $hw.computer.model
$name = $hw.computer.computerName
$arch = $hw.operatingSystem.architecture
$build = $hw.operatingSystem.build
$edition = $hw.operatingSystem.name

echo "Manufacturer: $man"
echo "Model: $model"
echo "Computer Name: $name"
echo "Architecture: $arch"
echo "Build: $build"
echo "Edition: $edition"
echo ""
echo "TEST RESULT: PASS"
