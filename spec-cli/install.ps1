#Requires -Version 5.1
<#
.SYNOPSIS
    Installs the spec CLI tool for Windows.
.DESCRIPTION
    Downloads the latest spec CLI release from GitHub and installs it to the user's local bin directory.
.EXAMPLE
    .\install.ps1
    Installs spec CLI to %USERPROFILE%\.local\bin
#>

$ErrorActionPreference = "Stop"

$Repo = "ThilinaTLM/claude-plugins"
$InstallDir = Join-Path $env:USERPROFILE ".local\bin"
$BinaryName = "spec.exe"

# Detect architecture
$Arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else {
    Write-Error "Error: 32-bit Windows is not supported"
    exit 1
}

$AssetName = "spec-windows-$Arch.exe"

Write-Host "Detected: windows-$Arch"
Write-Host "Installing spec CLI..."

# Get latest release info
try {
    $ReleaseUrl = "https://api.github.com/repos/$Repo/releases/latest"
    $Release = Invoke-RestMethod -Uri $ReleaseUrl -Headers @{ "User-Agent" = "spec-installer" }
    $Asset = $Release.assets | Where-Object { $_.name -eq $AssetName }

    if (-not $Asset) {
        Write-Error "Error: Could not find release asset for $AssetName"
        Write-Host "Available assets:"
        $Release.assets | ForEach-Object { Write-Host "  $($_.name)" }
        exit 1
    }

    $DownloadUrl = $Asset.browser_download_url
} catch {
    Write-Error "Error: Failed to fetch release info: $_"
    exit 1
}

# Create install directory if it doesn't exist
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$DestPath = Join-Path $InstallDir $BinaryName

# Download binary
Write-Host "Downloading from: $DownloadUrl"
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $DestPath -UseBasicParsing
} catch {
    Write-Error "Error: Failed to download binary: $_"
    exit 1
}

Write-Host ""
Write-Host "Installed: $DestPath"

# Check if install directory is in PATH
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$InstallDir*") {
    Write-Host ""
    Write-Host "Note: $InstallDir is not in your PATH."
    Write-Host ""
    Write-Host "To add it permanently, run:"
    Write-Host ""
    Write-Host "  `$path = [Environment]::GetEnvironmentVariable('Path', 'User')"
    Write-Host "  [Environment]::SetEnvironmentVariable('Path', `"`$path;$InstallDir`", 'User')"
    Write-Host ""
    Write-Host "Then restart your terminal."
}

Write-Host ""
Write-Host "Run 'spec --help' to get started."
