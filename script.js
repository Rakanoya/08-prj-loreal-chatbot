/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Check if all required DOM elements exist
if (!chatForm || !userInput || !chatWindow) {
  console.error(
    "Required DOM elements not found. Please check your HTML structure."
  );
}

// L'Oréal brand system prompt for the AI assistant
const SYSTEM_PROMPT = `You are L'Oréal's official beauty assistant, specialized exclusively in L'Oréal products and beauty expertise. You represent the world's leading beauty brand with over 100 years of innovation.

YOUR CORE MISSION:
- Help customers discover the perfect L'Oréal products for their beauty needs
- Provide expert guidance on L'Oréal skincare, makeup, haircare, and fragrance lines
- Share personalized beauty routines using L'Oréal products
- Educate about L'Oréal's innovative ingredients and technologies
- Build customer confidence in their beauty journey with L'Oréal

STAY STRICTLY ON-TOPIC. You ONLY discuss:
✅ L'Oréal products (makeup, skincare, haircare, fragrances)
✅ L'Oréal brands (Lancôme, Urban Decay, YSL Beauty, Kiehl's, etc.)
✅ Beauty routines and application techniques using L'Oréal products
✅ Ingredient benefits and product comparisons within L'Oréal range
✅ Skin types, hair types, and beauty concerns that L'Oréal addresses
✅ L'Oréal's innovation, sustainability, and brand values

❌ NEVER discuss:
- Competitor beauty brands or products
- Non-beauty topics (cooking, sports, politics, technology, etc.)
- Generic beauty advice without L'Oréal product recommendations
- Medical advice or treatments
- Personal information or topics unrelated to beauty

REDIRECT PROTOCOL:
If someone asks about anything outside your scope, respond: "I'm your dedicated L'Oréal beauty assistant! I'm here to help you discover amazing L'Oréal products and create the perfect beauty routine. What beauty goals can I help you achieve today? Are you looking for skincare, makeup, haircare, or fragrance recommendations?"

TONE: Professional, enthusiastic about L'Oréal, knowledgeable, and inspiring. Always mention specific L'Oréal products when possible.`;

// Conversation history for multi-turn context
let conversationHistory = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

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

// Set initial message after function definition
displayMessage(
  "✨ Welcome to L'Oréal! I'm your personal beauty assistant, ready to help you discover our amazing products and create your perfect beauty routine. Whether you're looking for skincare solutions, makeup must-haves, haircare essentials, or signature fragrances - I'm here to guide you! What beauty goals can I help you achieve today?",
  "ai"
);

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

    // Remove typing indicator by finding all thinking messages
    removeTypingIndicator();

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
    removeTypingIndicator();

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

// Helper function to remove typing indicators from chat
function removeTypingIndicator() {
  const messages = chatWindow.querySelectorAll(".msg");
  messages.forEach((msg) => {
    if (msg.textContent === "Thinking...") {
      // Remove the wrapper div that contains the message
      const wrapper = msg.parentNode;
      if (wrapper && wrapper.parentNode === chatWindow) {
        chatWindow.removeChild(wrapper);
      }
    }
  });
}

// Function to check if user input is likely on-topic for L'Oréal beauty
function isBeautyRelated(message) {
  // Sanitize input
  if (!message || typeof message !== "string") {
    return false;
  }

  const beautyKeywords = [
    // L'Oréal specific
    "loreal",
    "l'oreal",
    "lancome",
    "urban decay",
    "ysl",
    "kiehl",
    "maybelline",
    // Beauty categories
    "makeup",
    "skincare",
    "haircare",
    "fragrance",
    "perfume",
    "cosmetics",
    "foundation",
    "lipstick",
    "mascara",
    "eyeshadow",
    "blush",
    "concealer",
    "moisturizer",
    "cleanser",
    "serum",
    "toner",
    "cream",
    "lotion",
    "shampoo",
    "conditioner",
    "hair",
    "skin",
    "face",
    "eyes",
    "lips",
    // Beauty concerns
    "acne",
    "wrinkles",
    "aging",
    "dry",
    "oily",
    "sensitive",
    "dull",
    "routine",
    "beauty",
    "color",
    "shade",
    "application",
    "tips",
    // Beauty actions
    "recommend",
    "suggest",
    "help",
    "choose",
    "pick",
    "best",
    "good",
  ];

  const lowerMessage = message.toLowerCase().trim();
  return (
    beautyKeywords.some((keyword) => lowerMessage.includes(keyword)) ||
    lowerMessage.length < 50
  ); // Allow short questions that might be beauty-related
}

// Function to provide immediate redirect for clearly off-topic questions
function getOffTopicResponse() {
  return "I'm your dedicated L'Oréal beauty assistant! I'm here to help you discover amazing L'Oréal products and create the perfect beauty routine. What beauty goals can I help you achieve today? Are you looking for skincare, makeup, haircare, or fragrance recommendations?";
}

/* Handle form submit */

// Variable to prevent multiple simultaneous requests
let isProcessing = false;

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Prevent multiple simultaneous submissions
  if (isProcessing) {
    return;
  }

  // Get user input and validate
  const message = userInput.value.trim();
  if (!message) return;

  // Check message length (prevent extremely long messages)
  if (message.length > 1000) {
    displayMessage("Please keep your message under 1000 characters.", "ai");
    return;
  }

  // Disable form inputs to prevent multiple submissions
  setFormDisabled(true);

  // Set processing flag
  isProcessing = true;

  try {
    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: message });

    // Check if the message is likely off-topic
    if (!isBeautyRelated(message)) {
      // Provide immediate response for off-topic questions
      const offTopicResponse = getOffTopicResponse();

      // Add off-topic response to conversation history
      conversationHistory.push({
        role: "assistant",
        content: offTopicResponse,
      });

      // Re-render conversation to show both user message and redirect response
      renderConversation();

      // Clear input field
      userInput.value = "";

      // Don't call OpenAI API for obvious off-topic questions
      return;
    }

    // Re-render conversation to show user message
    renderConversation();

    // Clear input field
    userInput.value = "";

    // Call OpenAI API with full conversation history
    await callOpenAI();
  } finally {
    // Always reset processing flag
    isProcessing = false;

    // Re-enable form inputs
    setFormDisabled(false);
  }
});

// Disable/enable form inputs during processing
function setFormDisabled(disabled) {
  if (userInput && chatForm) {
    userInput.disabled = disabled;
    const submitBtn = chatForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = disabled;
    }

    // Focus management for accessibility
    if (!disabled && userInput) {
      // Re-focus input when form is re-enabled
      setTimeout(() => userInput.focus(), 100);
    }
  }
}
