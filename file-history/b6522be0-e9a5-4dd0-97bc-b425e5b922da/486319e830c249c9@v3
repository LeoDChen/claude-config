#Requires -RunAsAdministrator
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Kill M365Copilot"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kill M365Copilot Process" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Kill all M365Copilot processes
Write-Host ""
Write-Host "[1] Killing M365Copilot processes..." -ForegroundColor Yellow
$procs = Get-Process -Name "M365Copilot" -ErrorAction SilentlyContinue
if ($procs) {
    $procs | ForEach-Object {
        Write-Host "  Killing PID $($_.Id)..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
    Write-Host "  Done." -ForegroundColor Green
} else {
    Write-Host "  No running M365Copilot found." -ForegroundColor Gray
}

# 2. Disable autostart for Microsoft Office Hub
Write-Host ""
Write-Host "[2] Blocking Office Hub from autostarting..." -ForegroundColor Yellow

# Find Office Hub autostart entries
$startupPaths = @(
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup",
    "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup"
)
Get-ChildItem $startupPaths -Filter "*Office*" -ErrorAction SilentlyContinue |
    ForEach-Object { Write-Host "  Found startup: $_" }

# Registry Run keys
$runKeys = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
)
foreach ($key in $runKeys) {
    $props = Get-ItemProperty $key -ErrorAction SilentlyContinue
    $props.PSObject.Properties | Where-Object { $_.Name -match 'Office|Copilot|M365' } | ForEach-Object {
        Write-Host "  Found Run key: $($_.Name) = $($_.Value)" -ForegroundColor Gray
        Remove-ItemProperty -Path $key -Name $_.Name -Force -ErrorAction SilentlyContinue
        Write-Host "    -> Removed." -ForegroundColor Green
    }
}

# 3. Kill Office Hub background task
Write-Host ""
Write-Host "[3] Disabling Office Hub background tasks..." -ForegroundColor Yellow
Get-ScheduledTask | Where-Object { $_.TaskPath -match 'Microsoft\\\\Office' -and $_.TaskName -match 'Hub|Copilot' } |
    ForEach-Object {
        Write-Host "  Disabling: $($_.TaskName)" -ForegroundColor Gray
        Disable-ScheduledTask -TaskName $_.TaskName -TaskPath $_.TaskPath -ErrorAction SilentlyContinue
    }

# 4. Optional: Remove Microsoft Office Hub entirely (this also removes M365Copilot)
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  M365Copilot should no longer appear." -ForegroundColor Green
Write-Host ""
Write-Host "  If you want to remove the ENTIRE Office Hub" -ForegroundColor Yellow
Write-Host "  (includes M365Copilot but also removes Office" -ForegroundColor Yellow
Write-Host "  integration features), run this as admin:" -ForegroundColor Yellow
Write-Host ""
Write-Host "    Get-AppxPackage -AllUsers Microsoft.MicrosoftOfficeHub | Remove-AppxPackage -AllUsers" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Read-Host "`nPress Enter to exit"
