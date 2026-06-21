# Pack Carriya for Hostinger VPS upload (excludes node_modules and secrets from zip name only - INCLUDE backend/.env manually if needed)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outZip = Join-Path $root "carriya-deploy.zip"

Write-Host "Building frontend..."
Push-Location (Join-Path $root "frontend")
if (!(Test-Path ".env.production")) {
  Copy-Item ".env.production.example" ".env.production"
}
npm run build
Pop-Location

Write-Host "Creating $outZip ..."
if (Test-Path $outZip) { Remove-Item $outZip -Force }

$staging = Join-Path $env:TEMP "carriya-deploy-staging"
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

$items = @(
  "backend\src",
  "backend\package.json",
  "backend\package-lock.json",
  "backend\uploads",
  "frontend\build",
  "frontend\package.json",
  "frontend\package-lock.json",
  "frontend\.env.production",
  "deploy",
  "package.json",
  "HOSTINGER_DEPLOYMENT.md",
  "deploy\DEPLOY-CARRYIA.md"
)

foreach ($item in $items) {
  $src = Join-Path $root $item
  if (Test-Path $src) {
    $dest = Join-Path $staging $item
    $destDir = Split-Path $dest -Parent
    if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $src $dest -Recurse -Force
  }
}

# Copy backend .env if it exists (user must secure this file)
$envFile = Join-Path $root "backend\.env"
if (Test-Path $envFile) {
  Copy-Item $envFile (Join-Path $staging "backend\.env") -Force
  Write-Host "Included backend/.env — edit FRONTEND_URL and NODE_ENV on server before starting."
} else {
  Write-Warning "backend/.env not found — create it on the VPS from .env.example"
}

Compress-Archive -Path "$staging\*" -DestinationPath $outZip -Force
Remove-Item $staging -Recurse -Force

Write-Host "Done: $outZip"
Write-Host "Upload to VPS /var/www/carriya and unzip, then follow deploy/DEPLOY-CARRYIA.md"
