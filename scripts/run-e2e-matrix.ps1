param(
    [string]$Sdk = "$env:LOCALAPPDATA\Android\Sdk",
    [ValidateSet(33, 34, 36)][int[]]$Apis = @(33, 34, 36),
    [string[]]$Scales = @("1.0", "1.3", "1.5"),
    [ValidateRange(1, 3)][int]$Repetitions = 1,
    [string]$Existing16KSerial = "",
    [switch]$LongAlarms,
    [string]$TestClass = "com.remedin.e2e.RemedinFlowsTest"
)
$ErrorActionPreference = "Stop"
if ($Existing16KSerial -and $Existing16KSerial -notmatch '^emulator-\d+$') {
    throw "Only emulator serials are accepted."
}
$oldSerial = $env:ANDROID_SERIAL
$failed = @()
$profiles = @(
    @{ Api = 33; Port = 5560; Size = "720x1600"; Density = 320 },
    @{ Api = 34; Port = 5562; Size = "1080x2400"; Density = 440 },
    @{ Api = 36; Port = 5564; Size = "1080x2400"; Density = 420 }
)
function Run-Scales([string]$serial) {
    $env:ANDROID_SERIAL = $serial
    foreach ($scale in $Scales) {
        for ($iteration = 1; $iteration -le $Repetitions; $iteration++) {
            $arguments = @((Join-Path $PSScriptRoot "run-e2e.mjs"), "--font=$scale", "--class=$TestClass")
            if ($LongAlarms) { $arguments += "--long-alarms" }
            & node @arguments
            if ($LASTEXITCODE -ne 0) { $script:failed += "$serial / font $scale / run $iteration" }
        }
    }
}
try {
    foreach ($profile in ($profiles | Where-Object { $Apis -contains $_.Api })) {
        $serial = "emulator-$($profile.Port)"
        $connected = & adb devices
        if ($connected -match "(?m)^$serial\s") { throw "Port $($profile.Port) already in use; do not stop an unknown emulator." }
        $name = "Remedin_E2E_API_$($profile.Api)"
        Start-Process -FilePath (Join-Path $Sdk "emulator\emulator.exe") -ArgumentList @(
            "-avd", $name, "-port", $profile.Port, "-no-window", "-no-audio", "-no-snapshot",
            "-gpu", "swiftshader", "-memory", "2048"
        ) -WindowStyle Hidden | Out-Null
        try {
            $deadline = (Get-Date).AddMinutes(5)
            do {
                Start-Sleep -Seconds 2
                $booted = ""
                try {
                    $value = & adb -s $serial shell getprop sys.boot_completed 2>$null
                    if ($LASTEXITCODE -eq 0) { $booted = ($value -join "`n").Trim() }
                } catch { $booted = "" }
            } while ($booted -ne "1" -and (Get-Date) -lt $deadline)
            if ($booted -ne "1") { throw "$name did not boot within 5 minutes" }
            & adb -s $serial shell wm size $profile.Size
            if ($LASTEXITCODE -ne 0) { throw "Failed to configure resolution on $serial" }
            & adb -s $serial shell wm density $profile.Density
            if ($LASTEXITCODE -ne 0) { throw "Failed to configure density on $serial" }
            Run-Scales $serial
        } finally {
            & adb -s $serial emu kill
            if ($LASTEXITCODE -ne 0) { throw "Failed to stop dedicated emulator $serial" }
        }
    }
    if ($Existing16KSerial) {
        $api = & adb -s $Existing16KSerial shell getprop ro.build.version.sdk
        if ($LASTEXITCODE -ne 0 -or $api.Trim() -ne "37") { throw "Existing emulator must use API 37" }
        $pageSize = & adb -s $Existing16KSerial shell getconf PAGE_SIZE
        if ($LASTEXITCODE -ne 0) { throw "Failed to read page size on $Existing16KSerial" }
        if ($pageSize.Trim() -ne "16384") { throw "Existing emulator is not using 16 KB pages" }
        Run-Scales $Existing16KSerial
    }
} finally {
    $env:ANDROID_SERIAL = $oldSerial
}
if ($failed.Count -gt 0) { throw ("E2E failures: " + ($failed -join "; ")) }
