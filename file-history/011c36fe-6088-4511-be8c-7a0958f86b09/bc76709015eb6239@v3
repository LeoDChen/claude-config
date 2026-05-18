param(
    [string]$sound = "Windows Ding"
)

$configPath = "$env:USERPROFILE\.claude\sound_config.json"

if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    if (-not $config.enabled) { exit 0 }
}

$soundFile = "C:\Windows\Media\$sound.wav"
if (-not (Test-Path $soundFile)) { exit 1 }

$player = New-Object -ComObject WMPlayer.OCX
$player.URL = $soundFile

$timeout = 0
while ($player.playState -ne 1 -and $timeout -lt 50) {
    Start-Sleep -Milliseconds 100
    $timeout++
}
$player.close()
