// static/script.js

let currentUser = "";
let currentContext = ""; 
// ใส่ URL n8n ของคุณตรงนี้
const N8N_WEBHOOK = 'https://6422-223-207-115-110.ngrok-free.app/webhook/Retrieve';

// --- 1. History & Navigation (ระบบย้อนกลับ) ---
window.onpopstate = function(event) {
    if (event.state) {
        showScreen(event.state.screen);
    } else {
        showScreen('login-screen');
    }
};

function navigateTo(screenId) {
    document.querySelectorAll('#app > section').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    history.pushState({ screen: screenId }, null, "");
}

function showScreen(screenId) {
    document.querySelectorAll('#app > section').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function goBack() {
    window.history.back();
}

// --- 2. Login & Flow (ระบบล็อกอินและเลือกโหมด) ---
function login() {
    const name = document.getElementById('username').value;
    if (!name) return alert("กรุณาใส่ชื่อเล่นก่อนนะคะ 🌸");
    currentUser = name;
    navigateTo('selection-screen');
}

function selectMode(mode) {
    if (mode === 'passive') {
        startChat('passive');
    } else {
        navigateTo('active-submenu');
    }
}

function selectActiveOption(option) {
    startChat(option);
}

// --- 3. Chat System (ระบบแชท) ---
function startChat(context) {
    currentContext = context;
    navigateTo('chat-screen');

    const badge = document.getElementById('topic-badge');
    const chatBox = document.getElementById('chat-box');
    let welcomeMsg = "";

    if (context === 'passive') {
        badge.innerText = "โหมดให้คำแนะนำคุณแม่ 🌸";
        welcomeMsg = `สวัสดีค่ะคุณแม่ ${currentUser} มีเรื่องอะไรให้ Glumii ช่วยดูแล หรืออยากชวนคุยเรื่องไหนพิมพ์มาได้เลยนะคะ 😊`;
    } else if (context === 'sugar') {
        badge.innerText = "บันทึกค่าน้ำตาล 🩸";
        welcomeMsg = `สวัสดีค่ะคุณแม่ ${currentUser} วันนี้เจาะน้ำตาลหรือยังคะ? <br>อย่าลืมมาบันทึกค่ากับ Glumii นะ`;
    } else if (context === 'food') {
        badge.innerText = "บันทึกมื้ออาหาร 🥪";
        const hour = new Date().getHours();
        let meal = (hour < 11) ? "มื้อเช้า" : (hour < 16) ? "มื้อเที่ยง" : "มื้อเย็น";
        welcomeMsg = `สวัสดีค่ะ ${meal} คุณแม่${currentUser}รับประทานอะไรหรือยังคะ? Glumii ช่วยคำนวณได้นะคะ`;
    }

    chatBox.innerHTML = `<div class="msg bot-msg">${welcomeMsg}</div>`;
}

// --- ส่วนที่หายไปคราวก่อนเริ่มตรงนี้ครับ ---

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    // 1. แสดงข้อความฝั่งคนพิมพ์
    appendMessage(message, 'user-msg');
    input.value = "";

    // 2. ส่งไปหา n8n
    try {
        const response = await fetch(N8N_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user: currentUser, 
                context: currentContext, 
                text: message 
            })
        });
        const data = await response.json();
        
        // 3. แสดงคำตอบจาก Glumii (Bot)
        appendMessage(data.output, 'bot-msg');
    } catch (e) {
        console.error(e);
        appendMessage("Glumii มึนหัวนิดหน่อยค่ะ (เชื่อมต่อไม่ได้) 😵‍💫", "bot-msg");
    }
}

// ฟังก์ชันช่วยแสดงข้อความลงกล่อง
function appendMessage(text, type) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// --- 4. Admin Trigger (ปุ่มลอย & หน้าต่างจำลอง) ---
function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    panel.classList.toggle('hidden-panel');
}

function simulateTrigger() {
    const input = document.getElementById('trigger-msg');
    const val = input.value;
    if(val) {
        appendMessage(`(ระบบทัก): ${val}`, 'bot-msg');
        input.value="";
    }
}

// --- 5. Event Listeners (ทำให้ปุ่มทำงาน) ---
document.addEventListener('DOMContentLoaded', () => {
    // กดปุ่มส่ง
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    // กด Enter เพื่อส่ง
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // เริ่มต้นกันคนกด Back แล้วหน้าขาว ให้เริ่มที่หน้า Login เสมอถ้าไม่มี History
    history.replaceState({ screen: 'login-screen' }, null, "");
});