(function () {
  // ✅ Get chatbotID from the script URL
  const scripts = document.getElementsByTagName("script");
  const currentScript = scripts[scripts.length - 1];
  const urlParams = new URLSearchParams(currentScript.src.split("?")[1]);
  const chatbotID = urlParams.get("chatbotID");

  if (!chatbotID) {
    console.error("❌ No chatbotID provided in embed.js URL!");
    return;
  }
console.log("✅ Chatbot ID:", chatbotID);
  // ✅ Backend API URL
  //const API_URL = "http://localhost:3001"; // Change to your cloud URL when deployed
const API_URL = "https://api.gatheroapp.com"; 
  // ✅ Create floating button
  const chatButton = document.createElement("div");
  chatButton.id = "floatingChatbot";
  chatButton.style.position = "fixed";
  chatButton.style.bottom = "20px";
  chatButton.style.right = "20px";
  chatButton.style.width = "60px";
  chatButton.style.height = "60px";
  chatButton.style.background = "#4f46e5";
  chatButton.style.borderRadius = "50%";
  chatButton.style.cursor = "pointer";
  chatButton.style.zIndex = 9999;
  chatButton.style.display = "flex";
  chatButton.style.alignItems = "center";
  chatButton.style.justifyContent = "center";
  chatButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  chatButton.title = "Chat with Bot";

  chatButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="28" height="28"><path d="M2 2h20v20H2z"/></svg>`;

  document.body.appendChild(chatButton);

  // ✅ Create iframe container
  const chatContainer = document.createElement("iframe");
  chatContainer.src = `${API_URL}/chatbot/${chatbotID}?embed=true`; // This should render your chatbot UI
  chatContainer.style.position = "fixed";
  chatContainer.style.bottom = "90px";
  chatContainer.style.right = "20px";
  chatContainer.style.width = "350px";
  chatContainer.style.height = "500px";
  chatContainer.style.border = "1px solid #ddd";
  chatContainer.style.borderRadius = "8px";
  chatContainer.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
  chatContainer.style.zIndex = 9998;
  chatContainer.style.display = "none"; // Hidden initially

  document.body.appendChild(chatContainer);

  // ✅ Toggle iframe on button click
  chatButton.addEventListener("click", () => {
    chatContainer.style.display =
      chatContainer.style.display === "none" ? "block" : "none";
  });

  // ✅ Optional: close iframe on outside click
  window.addEventListener("click", (e) => {
    if (
      e.target !== chatButton &&
      e.target !== chatContainer &&
      !chatContainer.contains(e.target)
    ) {
      chatContainer.style.display = "none";
    }
  });
})();
