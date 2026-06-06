# VendorBridge AI Startup Script
Write-Host "Starting VendorBridge AI..." -ForegroundColor Cyan

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Ensure dependencies are installed
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Push database schema (Requires PostgreSQL to be running)
Write-Host "Setting up database..." -ForegroundColor Cyan
cd packages\database
Copy-Item "..\..\.env" ".env" -ErrorAction SilentlyContinue
try {
    npx prisma generate
    npx prisma db push --accept-data-loss
    Write-Host "Seeding database with demo data..." -ForegroundColor Cyan
    npx tsx seed.ts
} catch {
    Write-Host "Warning: Failed to connect to PostgreSQL. Please ensure your local PostgreSQL server is running at localhost:5432 with username/password 'postgres'." -ForegroundColor Red
}
cd ..\..

# Start the application
Write-Host "Starting development servers..." -ForegroundColor Green
npm run dev
