# RoboVault - One-Click GitHub Push Script

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   RoboVault -> GitHub Push Assistant   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Resolve Git executable
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if ($gitCmd) {
    $git = $gitCmd.Source
} else {
    $desktopGit = "C:\Users\sabarivasan\AppData\Local\GitHubDesktop\app-3.6.6\resources\app\git\cmd\git.exe"
    if (Test-Path $desktopGit) {
        $git = $desktopGit
    } else {
        Write-Host "Error: Git executable could not be found." -ForegroundColor Red
        Exit 1
    }
}

Write-Host "[✓] Git binary detected: $git" -ForegroundColor Green

Set-Location -Path $PSScriptRoot

# 2. Check remote origin
$origin = & $git remote get-url origin 2>$null
if (-not $origin) {
    $origin = "https://github.com/sabarivasan2308/RoboVault.git"
    & $git remote add origin $origin
}

Write-Host "[✓] Target Remote: $origin" -ForegroundColor Cyan

# 3. Push to main branch
Write-Host "`nAttempting git push to origin main..." -ForegroundColor Yellow
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==================================================" -ForegroundColor Green
    Write-Host " [✓] SUCCESS: RoboVault pushed to GitHub!         " -ForegroundColor Green
    Write-Host " View at: $origin                                 " -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Green
} else {
    Write-Host "`n==================================================" -ForegroundColor Yellow
    Write-Host " [!] NOTICE: Repository not yet created on GitHub." -ForegroundColor Yellow
    Write-Host " 1. Click this link to create the repo:           " -ForegroundColor White
    Write-Host "    https://github.com/new?name=RoboVault        " -ForegroundColor Cyan
    Write-Host " 2. Click 'Create repository' (leave all unchecked)" -ForegroundColor White
    Write-Host " 3. Run this script again to complete the push!   " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Yellow
}
