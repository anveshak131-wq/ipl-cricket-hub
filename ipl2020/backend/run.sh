#!/bin/bash

# IPL 2026 Backend - Quick Start Script

echo "🏏 IPL 2026 Secure Backend"
echo "=========================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Using default configuration."
    echo "   Copy .env.example to .env and customize for production!"
    echo ""
fi

# Start the server
echo "🚀 Starting IPL 2026 Backend Server..."
echo ""
echo "📊 Database: ipl_data.db"
echo "🔒 Default admin: username=admin, password=admin123"
echo "🌐 API will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

python app.py
