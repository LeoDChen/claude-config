[Console]::OutputEncoding = [Text.Encoding]::UTF8

Write-Host "=== Running Copilot processes ==="
Get-Process | Where-Object { $_.ProcessName -match 'copilot|Copilot' } | Format-Table Id, ProcessName, Path

Write-Host "=== Services with copilot ==="
Get-Service | Where-Object { $_.Name -match 'copilot|Copilot' } | Format-Table Name, Status

Write-Host "=== Copilot files in Program Files ==="
Get-ChildItem "C:\Program Files\WindowsApps\*Copilot*" -Directory -ErrorAction SilentlyContinue
Get-ChildItem "C:\Program Files\WindowsApps\*copilot*" -Directory -ErrorAction SilentlyContinue

Write-Host "=== Microsoft 365 / Office Copilot integration ==="
Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -match 'Copilot|Microsoft 365' } |
    Select-Object DisplayName | Format-List
