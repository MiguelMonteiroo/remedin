param([string]$Sdk = "$env:LOCALAPPDATA\Android\Sdk")
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$manager = Join-Path $Sdk "cmdline-tools\remedin-e2e\bin\sdkmanager.bat"
if (-not (Test-Path $manager)) {
    $catalog = [xml](Invoke-WebRequest -UseBasicParsing "https://dl.google.com/android/repository/repository2-3.xml").Content
    $package = $catalog.SelectNodes("//*[local-name()='remotePackage']") | Where-Object { $_.path -eq "cmdline-tools;19.0" }
    $archive = $package.SelectNodes(".//*[local-name()='archive']") | Where-Object { $_.'host-os' -eq "windows" }
    if (-not $archive.complete.url) { throw "Official Windows command-line tools not found" }
    $temp = Join-Path $env:TEMP "remedin-sdk-tools"
    New-Item -ItemType Directory -Force $temp | Out-Null
    $zip = Join-Path $temp "tools.zip"
    & curl.exe --fail --location --retry 2 --silent --show-error --output $zip ("https://dl.google.com/android/repository/" + $archive.complete.url)
    if ($LASTEXITCODE -ne 0) { throw "SDK download failed" }
    if ((Get-FileHash $zip -Algorithm SHA1).Hash.ToLower() -ne $archive.complete.checksum.InnerText) { throw "SDK archive checksum mismatch" }
    Expand-Archive -LiteralPath $zip -DestinationPath $temp -Force
    $destination = Join-Path $Sdk "cmdline-tools\remedin-e2e"
    New-Item -ItemType Directory -Force $destination | Out-Null
    Copy-Item -LiteralPath (Join-Path $temp "cmdline-tools\bin") -Destination $destination -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $temp "cmdline-tools\lib") -Destination $destination -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $temp "cmdline-tools\source.properties") -Destination $destination -Force
}
$avdmanager = Join-Path $Sdk "cmdline-tools\remedin-e2e\bin\avdmanager.bat"
foreach ($api in @(33, 34, 36)) {
    $image = "system-images;android-$api;google_apis;x86_64"
    & $manager "--sdk_root=$Sdk" $image
    if ($LASTEXITCODE -ne 0) { throw "Failed to install API $api" }
    "no" | & $avdmanager create avd --name "Remedin_E2E_API_$api" --package $image --device "pixel_6" --force
    if ($LASTEXITCODE -ne 0) { throw "Failed to create API $api AVD" }
}
