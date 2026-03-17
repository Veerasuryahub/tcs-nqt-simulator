Write-Host "Starting TCS NQT Simulator..." -ForegroundColor Cyan

# Check if .env has been updated
$envFile = Get-Content "backend\.env" -Raw
if ($envFile -match "your_mongodb_atlas_uri" -or $envFile -match "admin:password") {
    Write-Host "WARNING: You have not updated the MONGODB_URI in backend\.env" -ForegroundColor Yellow
    Write-Host "The application will start, but database operations will fail." -ForegroundColor Yellow
}

# Start Backend
Write-Host "Starting Backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start Frontend
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "App is running!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:5000"
