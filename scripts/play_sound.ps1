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

(New-Object System.Media.SoundPlayer $soundFile).PlaySync()
