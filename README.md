# L'Oréal Beauty Assistant Chatbot

A beautiful, branded c## Security & Production Benefits

- ✅ **API Key Security**: OpenAI API key is stored securely in Cloudflare Worker environment
- ✅ **No Local Secrets**: No need to manage API keys in your frontend code
- ✅ **CORS Handled**: Cloudflare Worker properly handles cross-origin requests
- ✅ **Production Ready**: Can be deployed anywhere without additional backend setup
- ✅ **Global Performance**: Cloudflare's global network ensures fast response times

## Architecture

```
User Input → Frontend (script.js) → Cloudflare Worker → OpenAI API → Response
```

The Cloudflare Worker acts as a secure proxy that:

1. Receives requests from your frontend
2. Adds the OpenAI API key securely
3. Forwards requests to OpenAI
4. Returns responses with proper CORS headers interface that helps users with L'Oréal products, beauty routines, and skincare advice using OpenAI's GPT-4o model.

L'Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L'Oréal's extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## Features

- 🎨 **L'Oréal Branded Design**: Custom styling with L'Oréal's signature colors and branding
- 🤖 **AI-Powered Responses**: Uses OpenAI's GPT-4o model for intelligent beauty advice
- 💄 **Beauty-Focused**: Specifically trained to answer questions about L'Oréal products and beauty topics
- 📱 **Responsive Design**: Works great on desktop and mobile devices
- 🛡️ **Safe & Relevant**: Politely redirects off-topic questions back to beauty advice

## Setup Instructions

### ✅ Ready to Use!

This chatbot is configured to use a **Cloudflare Worker** that securely handles API requests to OpenAI. No additional setup is required - just open `index.html` in your web browser and start chatting!

### How It Works

The chatbot now uses a **secure Cloudflare Worker** endpoint:

- 🔒 **Secure**: Your OpenAI API key is stored safely in the Cloudflare Worker environment
- 🚀 **Fast**: Cloudflare's global network ensures quick response times
- 🛡️ **CORS-Friendly**: Properly configured to work from any domain
- 🌐 **Production-Ready**: No local API key storage needed

### Run the Project

1. Open `index.html` in your web browser
2. Start chatting with the L'Oréal beauty assistant!

## How It Works

The chatbot is configured with a specialized system prompt that:

- Only answers questions about L'Oréal products and beauty topics
- Provides helpful skincare, makeup, and haircare advice
- Recommends products for specific beauty needs
- Politely redirects unrelated questions back to beauty topics

## Customization

You can customize the AI behavior by modifying:

- **System Prompt**: Edit the `SYSTEM_PROMPT` variable in `script.js`
- **Worker Endpoint**: Update the Cloudflare Worker URL in `script.js` if you deploy your own
- **Styling**: Modify `style.css` to change colors, fonts, or layout

## Technologies Used

- **HTML/CSS/JavaScript**: Core web technologies
- **Cloudflare Workers**: Secure API proxy and CORS handling
- **OpenAI GPT-4o API**: AI-powered responses
- **Montserrat Font**: Google Fonts for typography
- **Material Icons**: Google's icon library

## Security Notes

- API keys are stored locally and excluded from version control
- For production use, consider using environment variables or a backend server
- The current setup is perfect for learning and developmentProject 8: L'Oréal Chatbot
  L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.
