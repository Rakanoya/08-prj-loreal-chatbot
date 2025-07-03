/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// L'Oréal brand system prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful L'Oréal beauty assistant. You specialize in L'Oréal products, skincare routines, makeup tips, haircare advice, and general beauty guidance.

Your role is to:
- Recommend L'Oréal products for specific beauty needs
- Provide skincare, makeup, and haircare tips
- Help users understand different beauty routines
- Answer questions about ingredients, product usage, and beauty trends
- Be friendly, professional, and knowledgeable about beauty

IMPORTANT: Only answer questions related to:
- L'Oréal products and services
- Beauty, skincare, makeup, and haircare topics
- General beauty advice and tips
- Ingredient information and product benefits

If someone asks about topics unrelated to L'Oréal or beauty (like cooking, sports, politics, etc.), politely redirect them back to beauty-related topics by saying something like: "I'm here to help with L'Oréal products and beauty advice. How can I assist you with your skincare, makeup, or haircare needs today?"

Always be helpful, positive, and encouraging about beauty and self-care.`;

// Conversation history for multi-turn context
let conversationHistory = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

// Set initial message
displayMessage(
  "👋 Hello! I'm your L'Oréal beauty assistant. How can I help you with your skincare, makeup, or haircare today?",
  "ai"
);

/* Function to display messages in the chat window */

// Display a message bubble in the chat window
function displayMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("msg", sender);
  messageDiv.textContent = message;

  // Create a wrapper to ensure proper clearing
  const messageWrapper = document.createElement("div");
  messageWrapper.style.overflow = "hidden"; // This creates a new block formatting context
  messageWrapper.appendChild(messageDiv);

  chatWindow.appendChild(messageWrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Clear all messages from the chat window
function clearChatWindow() {
  chatWindow.innerHTML = "";
}

// Render the full conversation history (except system prompt)
function renderConversation() {
  clearChatWindow();
  // Skip the system prompt
  for (let i = 1; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    if (msg.role === "user") {
      displayMessage(msg.content, "user");
    } else if (msg.role === "assistant") {
      displayMessage(msg.content, "ai");
    }
  }
}

/* Function to call Cloudflare Worker (which then calls OpenAI API) */

// Call the Cloudflare Worker with full conversation history
async function callOpenAI() {
  try {
    // Show typing indicator
    displayMessage("Thinking...", "ai");

    // Prepare the request for the Cloudflare Worker
    // Only send the last 10 messages for context (system prompt + last 9 turns)
    const messagesToSend = conversationHistory.slice(-10);

    const response = await fetch(
      "https://crimson-feather-5898.horseykate1129.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesToSend,
        }),
      }
    );

    // Remove typing indicator
    const messages = chatWindow.querySelectorAll(".msg");
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.textContent === "Thinking...") {
      chatWindow.removeChild(lastMessage);
    }

    // Check if request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Worker response error:", errorData);
      throw new Error(
        `Worker request failed: ${response.status} - ${JSON.stringify(
          errorData
        )}`
      );
    }

    // Get the response data
    const data = await response.json();

    // Check if the response contains an error (like API key issues)
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    // Check if we have the expected response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected response structure:", data);
      throw new Error("Unexpected response from AI service");
    }

    const aiResponse = data.choices[0].message.content;

    // Add assistant response to conversation history
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Re-render conversation
    renderConversation();
  } catch (error) {
    // Remove typing indicator if there was an error
    const messages = chatWindow.querySelectorAll(".msg");
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.textContent === "Thinking...") {
      chatWindow.removeChild(lastMessage);
    }

    console.error("Error calling Cloudflare Worker:", error);

    // Provide more specific error messages based on the error
    let errorMessage =
      "Sorry, I'm having trouble connecting right now. Please try again in a moment.";

    if (error.message.includes("invalid_api_key")) {
      errorMessage =
        "❌ API Configuration Issue: The OpenAI API key in the Cloudflare Worker needs to be updated. Please check your Cloudflare Worker environment variables.";
    } else if (error.message.includes("quota")) {
      errorMessage =
        "❌ API Quota Exceeded: The OpenAI API quota has been reached. Please check your OpenAI account billing.";
    } else if (error.message.includes("rate")) {
      errorMessage =
        "❌ Rate Limited: Too many requests. Please wait a moment and try again.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage =
        "❌ Network Issue: Please check your internet connection and try again.";
    }

    // Add error to conversation history as assistant
    conversationHistory.push({ role: "assistant", content: errorMessage });
    renderConversation();
  }
}

/* Handle form submit */

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: message });

  // Show only the latest user question above the AI response (reset each time)
  renderConversation();

  // Clear input field
  userInput.value = "";

  // Call OpenAI API with full conversation history
  await callOpenAI();
});
