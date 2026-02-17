# Fix Next.js dev lock - run this when you get "Unable to acquire lock" error
Write-Host "Stopping Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

$nextDir = "frontend\skillsync-ai\.next"
if (Test-Path $nextDir) {
  Write-Host "Removing .next folder..." -ForegroundColor Yellow
  Remove-Item -Path $nextDir -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Cleaned. Starting dev server..." -ForegroundColor Green
}

npm run dev
