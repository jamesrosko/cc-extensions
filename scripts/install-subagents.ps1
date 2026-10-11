# Copies subagents from this repo into the user-level Claude Code agents folder.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\install-subagents.ps1
$ErrorActionPreference = 'Stop'

$source = Join-Path $PSScriptRoot '..\subagents'
$dest = Join-Path $HOME '.claude\agents'

New-Item -ItemType Directory -Force $dest | Out-Null

$files = Get-ChildItem -Path $source -Filter '*.md'
foreach ($file in $files) {
    Copy-Item $file.FullName -Destination $dest -Force
    Write-Host "Installed $($file.Name)"
}

Write-Host "Copied $($files.Count) subagent(s) to $dest"
Write-Host 'Restart Claude Code, then run /agents to confirm.'
