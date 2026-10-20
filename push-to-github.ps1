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

Write-Host "[✓] Using Git: $git" -ForegroundColor Green

# 2. Check current status
Set-Location -Path $PSScriptRoot
& $git status

# 3. Prompt for GitHub repository URL
Write-Host "`nPlease enter your GitHub Repository URL" -ForegroundColor Yellow
Write-Host "Example: https://github.com/YOUR_USERNAME/RoboVault.git" -ForegroundColor DarkGray
$repoUrl = Read-Host "GitHub Repository URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "Repository URL cannot be empty. Aborted." -ForegroundColor Red
    Exit 1
}

# 4. Configure remote
$existingRemote = & $git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Updating existing origin to $repoUrl..." -ForegroundColor Cyan
    & $git remote set-url origin $repoUrl
} else {
    Write-Host "Adding remote origin $repoUrl..." -ForegroundColor Cyan
    & $git remote add origin $repoUrl
}

# 5. Push to main branch
Write-Host "`nPushing main branch to GitHub..." -ForegroundColor Cyan
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[✓] Successfully pushed RoboVault to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host "`n[!] Push failed. Please verify repository permissions or authentication." -ForegroundColor Red
}
