#!/bin/bash

# IPL Cricket Hub - AI Chatbot Quick Start Script

echo "🤖 IPL Cricket Hub - AI/ML Chatbot Starter"
echo "=========================================="
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    echo "Install from: https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Check if requirements are installed
echo "📦 Installing Python dependencies..."
cd api
pip3 install -r chatbot-requirements.txt --quiet

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🚀 Starting AI Chatbot Backend..."
echo ""
echo "🌐 Backend will run on: http://localhost:5001"
echo "📡 Features: ML Predictions, NLP, Sentiment Analysis"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

# Start the Flask server
python3 chatbot-ai.py
