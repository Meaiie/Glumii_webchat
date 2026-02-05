// script.js
let currentUser = "";
const N8N_WEBHOOK = 'YOUR_N8N_URL';

function login() {
    const name = document.getElementById('username').value;
    if (!name) return alert("กรุณาใส่ชื่อก่อนน้า");
    currentUser = name;
    document.getElementById('user-display').innerText = `คุณแม่ ${name}`;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user-msg');
    input.value = "";

    try {
        const response = await fetch(N8N_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: currentUser, text: message })
        });
        const data = await response.json();
        appendMessage(data.output, 'bot-msg');
    } catch (e) {
        appendMessage("Glumii ขอตัวไปพักแป๊บนึงนะคะ", "bot-msg");
    }
}

function simulateTrigger() {
    const triggerInput = document.getElementById('trigger-msg');
    if(!triggerInput.value) return;
    appendMessage(`(Glumii ทัก): ${triggerInput.value}`, 'bot-msg');
    triggerInput.value = "";
}

function appendMessage(text, type) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

document.getElementById('send-btn').addEventListener('click', sendMessage);

// ฟังก์ชันเปิด-ปิด Admin Panel
function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    const fab = document.getElementById('admin-fab');
    
    // สลับ class hidden-panel
    panel.classList.toggle('hidden-panel');
    
    // หมุนปุ่ม FAB เล่นๆ เวลาเปิด
    if (!panel.classList.contains('hidden-panel')) {
        fab.style.transform = "rotate(45deg)";
        fab.innerHTML = "×"; // เปลี่ยนไอคอนเป็นกากบาท
    } else {
        fab.style.transform = "rotate(0deg)";
        fab.innerHTML = "⚙️"; // เปลี่ยนกลับเป็นรูปเกียร์
    }
}