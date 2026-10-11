# Copies skills from this repo into the user-level Claude Code skills folder.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\install-skills.ps1
$ErrorActionPreference = 'Stop'

$source = Join-Path $PSScriptRoot '..\skills'
$dest = Join-Path $HOME '.claude\skills'

New-Item -ItemType Directory -Force $dest | Out-Null

# A skill is a folder containing SKILL.md.
$skills = Get-ChildItem -Path $source -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'SKILL.md') }
foreach ($skill in $skills) {
    $target = Join-Path $dest $skill.Name
    if (Test-Path $target) { Remove-Item $target -Recurse -Force }
    Copy-Item $skill.FullName -Destination $target -Recurse -Force
    Write-Host "Installed $($skill.Name)"
}

Write-Host "Copied $($skills.Count) skill(s) to $dest"
Write-Host 'Restart Claude Code to load them.'
