# PowerShell script to start the frontend development server
Write-Host "🚀 Starting Vue.js frontend development server..." -ForegroundColor Green

# Navigate to the Website directory
Set-Location $PSScriptRoot

# Start the frontend development server
Write-Host "⚡ Starting Vite development server..." -ForegroundColor Yellow
npm run dev

Write-Host "✅ Frontend development server started successfully!" -ForegroundColor Green
Write-Host "🌐 Development server will be available at:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:5173" -ForegroundColor White
Write-Host "   - Network: Check terminal for network URL" -ForegroundColor White

# Keep the script running
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Yellow
Read-Host "Press Enter to continue"
