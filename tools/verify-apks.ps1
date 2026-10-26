$ErrorActionPreference = 'Stop'
$env:JAVA_HOME = 'C:/Users/Origami/.jdks/jbr-21.0.11'
$buildTools = 'C:/Users/Origami/AppData/Local/Android/Sdk/build-tools/37.0.0'
$config = (Get-Content app.json -Raw | ConvertFrom-Json).expo
$expectedCertificate = 'fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c'
$abis = @('arm64-v8a','armeabi-v7a','x86','x86_64')
New-Item -ItemType Directory artifacts -Force | Out-Null
$results = foreach ($abi in $abis) {
    $sourceApk = (Resolve-Path "android/app/build/outputs/apk/release/app-$abi-release.apk").Path
    $badging = & "$buildTools/aapt.exe" dump badging $sourceApk
    if ($LASTEXITCODE -ne 0) { throw "Manifest verification failed: $abi" }
    $packageLine = ($badging | Where-Object { $_ -like 'package:*' } | Select-Object -First 1)
    if (!$packageLine.Contains("name='$($config.android.package)'") -or !$packageLine.Contains("versionCode='$($config.android.versionCode)'") -or !$packageLine.Contains("versionName='$($config.version)'")) { throw "Unexpected identity: $abi" }
    $nativeLine = ($badging | Where-Object { $_ -like 'native-code:*' }) -join ''
    if ($nativeLine -ne "native-code: '$abi'") { throw "Unexpected ABI: $nativeLine" }
    $signing = & "$buildTools/apksigner.bat" verify --verbose --print-certs $sourceApk
    if ($LASTEXITCODE -ne 0 -or ($signing -join "`n") -notmatch $expectedCertificate) { throw "Signing verification failed: $abi" }
    & "$buildTools/zipalign.exe" -c -P 16 4 $sourceApk
    if ($LASTEXITCODE -ne 0) { throw "Alignment verification failed: $abi" }
    $name = "divine-life-$($config.version)-$abi.apk"
    Copy-Item -LiteralPath $sourceApk -Destination "artifacts/$name" -Force
    $hash = (Get-FileHash "artifacts/$name" -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $name" | Set-Content "artifacts/$name.sha256" -Encoding ascii
    [PSCustomObject]@{ File = $name; Bytes = (Get-Item $sourceApk).Length; SHA256 = $hash }
}
$results | ConvertTo-Json | Set-Content artifacts/apk-manifest.json -Encoding utf8
$results | Format-Table File,Bytes
