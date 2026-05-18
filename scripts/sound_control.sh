#!/usr/bin/env bash
# 声音开关

CONFIG="$HOME/.claude/sound_config.json"

case "${1:-}" in
    on)
        powershell -Command "
            \$p = \"\$env:USERPROFILE\\.claude\\sound_config.json\"
            \$c = Get-Content \$p | ConvertFrom-Json
            \$c.enabled = \$true
            \$c | ConvertTo-Json | Set-Content \$p
            Write-Host '声音已开启'
        "
        ;;
    off)
        powershell -Command "
            \$p = \"\$env:USERPROFILE\\.claude\\sound_config.json\"
            \$c = Get-Content \$p | ConvertFrom-Json
            \$c.enabled = \$false
            \$c | ConvertTo-Json | Set-Content \$p
            Write-Host '声音已关闭'
        "
        ;;
    *)
        powershell -Command "
            \$p = \"\$env:USERPROFILE\\.claude\\sound_config.json\"
            \$c = Get-Content \$p | ConvertFrom-Json
            if (\$c.enabled) { Write-Host '声音: 开启' } else { Write-Host '声音: 关闭' }
        "
        ;;
esac
