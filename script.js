// Elements
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const chatForm = document.getElementById('chatForm');
const sendBtn = document.getElementById('sendBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const clearBtn = document.getElementById('clearBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const exportBtn = document.getElementById('exportBtn');
const typingIndicator = document.getElementById('typingIndicator');
const typingDots = document.getElementById('typingDots');
const imageBtn = document.getElementById('imageBtn');
const imageInput = document.getElementById('imageInput');
const stickerPicker = document.getElementById('stickerPicker');
const stickerBtn = document.getElementById('stickerBtn');

let messages = [];
const botReplies = [
  "🤖 Hello there!",
  "🤖 How can I help?",
  "🤖 Interesting!",
  "🤖 Tell me more!",
  "🤖 Haha, nice one!",
  "🤖 I'm listening!",
  "🤖 Cool!"
];

// Sounds
const sendSound = new Audio("https://www.soundjay.com/button/button-3.mp3");
const receiveSound = new Audio("https://www.soundjay.com/button/button-4.mp3");

let typingInterval;
let messageStatusTimeouts = new Map();

// Typing dots animation
function startTypingDots() {
  let dots = '';
  typingInterval = setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
    typingDots.textContent = dots;
  }, 500);
}
function stopTypingDots() {
  clearInterval(typingInterval);
  typingDots.textContent = '';
}

// Load messages from localStorage
function loadMessages() {
  const saved = localStorage.getItem('chatMessages');
  if (saved) {
    messages = JSON.parse(saved);
    messages.forEach(msg => addMessageToDOM(msg, false));
  }
}
// Save messages to localStorage
function saveMessages() {
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Add message to DOM with status
function addMessageToDOM(msg, save = true) {
  const { text, sender, time, type = 'text', status = 'sent' } = msg;

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.setAttribute('data-time', time);

  // Avatar
  const avatar = document.createElement('img');
  avatar.className = 'avatar';
  avatar.src = sender === 'user' ? 'https://i.imgur.com/7k12EPD.png' : 'https://i.imgur.com/8JjZXtD.png';
  avatar.alt = sender === 'user' ? 'User avatar' : 'Bot avatar';

  // Bubble container
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (type === 'text') {
    bubble.textContent = text;
  } else if (type === 'image' || type === 'sticker') {
    const img = document.createElement('img');
    img.src = text;
    img.alt = type === 'sticker' ? 'Sticker' : 'Image';
    bubble.appendChild(img);
  }

  // Timestamp
  const timeSpan = document.createElement('span');
  timeSpan.className = 'timestamp';
  timeSpan.textContent = time;
  bubble.appendChild(timeSpan);

  // Status indicator (only for user messages)
  let statusSpan;
  if (sender === 'user') {
    statusSpan = document.createElement('span');
    statusSpan.className = `status ${status}`;
    statusSpan.textContent = ''; // icons via CSS ::after
    bubble.appendChild(statusSpan);
  }

  // Append bubble and avatar in order depending on sender
  if (sender === 'user') {
    msgDiv.appendChild(bubble);
    msgDiv.appendChild(avatar);
  } else {
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) {
    messages.push(msg);
    saveMessages();
  }

  // If user message, simulate status updates: sent → delivered after delay
  if (sender === 'user') {
    updateMessageStatus(msgDiv, msg);
  }
}

// Simulate message status updates
function updateMessageStatus(msgDiv, msg) {
  const statusSpan = msgDiv.querySelector('.status');
  if (!statusSpan) return;

  statusSpan.className = 'status sent';

  // After 1.2s, change to delivered
  const timeoutId = setTimeout(() => {
    statusSpan.className = 'status delivered';
    msg.status = 'delivered';
    saveMessages();
  }, 1200);

  messageStatusTimeouts.set(msgDiv, timeoutId);
}

// Send text message
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  addMessageToDOM({ text, sender: 'user', time, type: 'text', status: 'sent' });
  messageInput.value = '';
  sendSound.play();

  typingIndicator.hidden = false;
  startTypingDots();

  setTimeout(() => {
    const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
    const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    stopTypingDots();
    typingIndicator.hidden = true;
    addMessageToDOM({ text: reply, sender: 'bot', time: botTime, type: 'text' });
    receiveSound.play();
  }, 1500);
}

// Send media message (image or sticker)
function sendMedia(src, type) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  addMessageToDOM({ text: src, sender: 'user', time, type, status: 'sent' });
  sendSound.play();

  typingIndicator.hidden = false;
  startTypingDots();

  setTimeout(() => {
    const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
    const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    stopTypingDots();
    typingIndicator.hidden = true;
    addMessageToDOM({ text: reply, sender: 'bot', time: botTime, type: 'text' });
    receiveSound.play();
  }, 1500);
}

// Toggle emoji or sticker picker
function togglePicker(type) {
  if (type === 'emoji') {
    if (emojiPicker.hidden) {
      emojiPicker.hidden = false;
      stickerPicker.hidden = true;
    } else {
      emojiPicker.hidden = true;
    }
  } else if (type === 'sticker') {
    if (stickerPicker.hidden) {
      stickerPicker.hidden = false;
      emojiPicker.hidden = true;
    } else {
      stickerPicker.hidden = true;
    }
  }
}

// Event Listeners

// Send message on form submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  sendMessage();
});

// Enable/disable send button based on input
messageInput.addEventListener('input', () => {
  sendBtn.disabled = messageInput.value.trim() === '';
});
messageInput.dispatchEvent(new Event('input'));

// Emoji picker toggle
emojiBtn.addEventListener('click', () => {
  togglePicker('emoji');
});

// Add emoji on picker click
emojiPicker.addEventListener('click', e => {
  if (e.target.textContent) {
    messageInput.value += e.target.textContent;
    messageInput.focus();
    sendBtn.disabled = false;
  }
});

// Sticker picker toggle
stickerBtn.addEventListener('click', () => {
  togglePicker('sticker');
});

// Send sticker on click
stickerPicker.addEventListener('click', e => {
  if (e.target.tagName === 'IMG') {
    sendMedia(e.target.src, 'sticker');
    stickerPicker.hidden = true;
  }
});

// Image upload button click
imageBtn.addEventListener('click', () => {
  emojiPicker.hidden = true;
  stickerPicker.hidden = true;
  imageInput.click();
});

// Handle image file selection
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    sendMedia(e.target.result, 'image');
  };
  reader.readAsDataURL(file);
  imageInput.value = '';
});

// Clear chat
clearBtn.addEventListener('click', () => {
  if (confirm("Clear all messages?")) {
    messages = [];
    saveMessages();
    chatBox.innerHTML = '';
  }
});

// Export chat history
exportBtn.addEventListener('click', () => {
  if (messages.length === 0) {
    alert("Nothing to export!");
    return;
  }
  let text = "Chat History:\n";
  messages.forEach(msg => {
    let prefix = msg.sender === 'user' ? 'You' : 'Bot';
    if (msg.type === 'image') prefix += " [Image]";
    else if (msg.type === 'sticker') prefix += " [Sticker]";
    text += `[${msg.time}] ${prefix}: ${msg.type === 'text' ? msg.text : '[media]'}\n`;
  });
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat_history.txt';
  a.click();
  URL.revokeObjectURL(url);
});

// Theme toggle
function loadTheme() {
  const theme = localStorage.getItem('chatTheme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    themeToggleBtn.textContent = '🌙';
  }
}
themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('chatTheme', isDark ? 'dark' : 'light');
});

// Initialize
loadMessages();
loadTheme();
