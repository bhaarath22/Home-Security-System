# 🔫 Weapon Detection System using Gemini API

Weapon detection system, delivered through a user-friendly web application built with **Streamlit** and powered by **Google's Gemini API**. 🚀 Users can either upload an image file or take a picture in real-time using their device's camera. If a weapon is detected, the system is designed to send an immediate and discreet alert to a specified Telegram chat, complete with the image and analysis results. 📱

## 🚀 Key Features

- 🖼️ **Dual Input Methods**: Effortlessly upload an image file (.jpg, .jpeg, .png) or capture a photo directly from a camera for instant analysis
- 🧠 **AI-Powered Analysis**: Utilizes the cutting-edge gemini-1.5-flash model for fast and accurate image recognition and analysis
- 🔔 **Instant Telegram Alerts**: Automatically sends a detailed notification, including the image, to a designated Telegram chat the moment a weapon is identified
- 🔒 **Secure by Design**: Protects your sensitive API keys and credentials by loading them from a secure .env file, keeping them out of the main codebase
- 🖥️ **User-Friendly Interface**: A clean, simple, and intuitive UI built with Streamlit makes the application accessible to everyone

## 🛠️ Tech Stack

- **Backend**: Python 🐍
- **Web Framework**: Streamlit 🌐
- **AI Model**: Google Gemini 1.5 Flash ✨
- **Notifications**: Telegram Bot API 📞
- **Core Libraries**: google-generativeai, requests, Pillow, python-dotenv 📚

## ⚙️ Setup & Installation Guide

Follow these detailed steps to get the application running on your local machine. 💻

### Step 1: Clone the Repository 📥

First, you need to get the project files onto your computer. Open your terminal or command prompt and use git to clone the repository.

```bash
# Clone the repository from GitHub
git clone https://github.com/your-username/weapon-detection-gemini.git

# Navigate into the newly created project directory
cd weapon-detection-gemini
```

### Step 2: Create a Virtual Environment 🏠

A virtual environment is a self-contained directory that holds a specific version of Python plus all the necessary libraries for a project. This is a best practice to avoid conflicts between projects. 🔧

```bash
# Create the virtual environment folder named 'venv'
python -m venv venv

# Activate the environment to start using it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```

You'll know it's active when you see `(venv)` at the beginning of your terminal prompt. ✅

### Step 3: Install Dependencies 📦

This project relies on several Python libraries. A `requirements.txt` file lists all of them so you can install them with a single command.

Create a file named `requirements.txt` in your project's root directory. 📝
Add the following library names to the file:

```
streamlit
google-generativeai
requests
Pillow
python-dotenv
```

Now, run the installation command:

```bash
# Pip will read the file and install every library listed
pip install -r requirements.txt
```

## 🔑 API Key Configuration

This application needs to connect to external services (Google Gemini and Telegram), which requires authentication using API keys. 🗝️

### Step 4: Obtain Your API Keys

#### 1. Google Gemini API Key 🤖

- Navigate to [Google AI Studio](https://aistudio.google.com/) 🌐
- Sign in with your Google account 👤
- On the left-hand menu, click "Get API key" 🔑
- Click the "Create API key in new project" button ➕
- Your unique API key will be generated. Copy this key immediately and store it safely! 💾

#### 2. Telegram Bot Token and Chat ID ✈️

**Get Your Bot Token:** 🤖

- Open your Telegram app and search for the official **BotFather** bot 🔍
- Start a chat with BotFather and send the command: `/newbot` 💬
- Follow the prompts to choose a name and username for your bot 📝
- BotFather will provide you with a unique API token. This is your bot's password—keep it secret! 🔒

**Get Your Chat ID:** 🆔

- Find the bot you just created in Telegram and send it a message (anything, like `/start` or "hello") 👋
- Now, search for another bot called `@userinfobot` 🔍
- Start a chat with `@userinfobot`, and it will instantly reply with your user information, including your User ID. This is the Chat ID for your personal chat with the bot 📋
- *(Optional)* If you want alerts sent to a group, create a group, add your bot to it, and then find the group's ID (it will be a negative number) 👥

### Step 5: Create the .env File 📄

To keep your secret keys safe, we'll store them in a special `.env` file that is ignored by version control. 🛡️

- In the main directory of your project, create a new file named exactly `.env` 📁
- Open this file and add your keys in the following `KEY="VALUE"` format:

```env
GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
TELEGRAM_BOT_TOKEN="PASTE_YOUR_TELEGRAM_BOT_TOKEN_HERE"
TELEGRAM_CHAT_ID="PASTE_YOUR_TELEGRAM_CHAT_ID_HERE"
```

Replace the placeholder text with the actual keys you obtained. Save the file. The Python script is coded to securely load these values from this file. ✅

## ▶️ Running the Application

With all the setup and configuration complete, you can now launch the application. 🎯

```bash
# Ensure your virtual environment is still active!
streamlit run app.py
```

Your default web browser will automatically open a new tab with the application running, typically at `http://localhost:8501`. 🌐

## 📖 How to Use the App

1. **Choose Input Method**: On the app's interface, select either "Upload an image" or "Take a picture with camera" 🖼️📸

2. **Provide Image**: 
   - 📤 **Upload**: Click "Browse files" to select an image from your device
   - 📸 **Camera**: Grant the browser permission to use your camera, then click the "Take a picture" button

3. **Analyze**: 
   - For uploaded images, you must click the "Analyze for Weapons" button to start the process 🔍
   - For camera pictures, the analysis begins automatically once the photo is snapped ⚡

4. **View Results**: The analysis results will be displayed directly on the screen 📊

5. **Check Alerts**: If a weapon is detected, a notification with the analysis and the incriminating image will be instantly sent to your configured Telegram chat 🚨📱

***