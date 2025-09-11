
/*app.js*/
const state = {
currentUser: null, // {id,name,role,email}
categories: ['Resume', 'DSA', 'Frontend', 'Backend', 'ML/AI', 'Career', 'Subject'],
users: [],
tutors: [],
bookings: [],
query: ''
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const navigate = (hash) => { if (location.hash !== hash) location.hash = hash; else render(); };
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtTime = (iso) => new Date(iso).toLocaleString();
const jitRoom = () => `https://meet.jit.si/justy_${uid()}_${Date.now()}`;

function save() {
localStorage.setItem('justy_state', JSON.stringify({
users: state.users,
 tutors: state.tutors,
 bookings: state.bookings
}));
if (state.currentUser) localStorage.setItem('justy_me', JSON.stringify(state.currentUser));
}
function load() {
const cached = JSON.parse(localStorage.getItem('justy_state') || '{}');
state.users = cached.users || [];
state.tutors = cached.tutors || seedTutors();
state.bookings = cached.bookings || [];
const me = JSON.parse(localStorage.getItem('justy_me') || 'null');
state.currentUser = me;
}

function seedTutors() {
const sample = [
{name: 'Aditi', cats: ['Resume','Career'], price: 79, available: true, bio: 'Ex-FAANG, crisp resume feedback.', img: "C:\Users\H RAJU\Pictures\Screenshots\rahul.jpeg"},
{name: 'Rahul', cats: ['DSA','Backend'], price: 89, available: true, bio: 'DSA drills and code debug.', img: 'https://ui-avatars.com/api/?name=Rahul&background=1f2937&color=60a5fa&rounded=true'},
{name: 'Sara', cats: ['Frontend','Career'], price: 69, available: false, bio: 'UI/UX and React expert.', img: 'https://ui-avatars.com/api/?name=Sara&background=1f2937&color=60a5fa&rounded=true'},
{name: 'Meera', cats: ['ML/AI','Subject'], price: 119, available: true, bio: 'ML help, quick unblock.', img: 'https://ui-avatars.com/api/?name=Meera&background=1f2937&color=60a5fa&rounded=true'},
{name: 'Vikram', cats: ['Subject','Backend'], price: 75, available: true, bio: 'Clear explanations, Java/Spring.', img: 'https://ui-avatars.com/api/?name=Vikram&background=1f2937&color=60a5fa&rounded=true'}
];
return sample.map((t) => ({id: uid(), ...t}));
}

function logout() {
localStorage.removeItem('justy_me');
state.currentUser = null;
$('#navbar').classList.add('hidden');
navigate('#/signin');
}

function switchRole() {
if (!state.currentUser) return;
state.currentUser.role = state.currentUser.role === 'user' ? 'tutor' : 'user';
save();
navigate(state.currentUser.role === 'user' ? '#/user' : '#/tutor');
}

function ensureNavbar() {
const nav = $('#navbar');
if (!state.currentUser) { nav.classList.add('hidden'); return; }
nav.classList.remove('hidden');
$('#whoami').textContent = `${state.currentUser.name} — ${state.currentUser.role}`;
const catBar = $('#categoryBar');
catBar.innerHTML = '';
if (state.currentUser.role === 'user') {
const allBtn = document.createElement('button');
allBtn.className = 'category-btn active';
allBtn.textContent = 'All';
allBtn.onclick = () => filterByCategory(null);
catBar.appendChild(allBtn);
state.categories.forEach(c => {
const b = document.createElement('button');
b.className = 'category-btn';
b.textContent = c;
b.onclick = () => filterByCategory(c);
catBar.appendChild(b);
});
}
}

let currentCategory = null;
function filterByCategory(cat) {
currentCategory = cat;
$$('.category-btn').forEach(b => b.classList.remove('active'));
$$('.category-btn').find(b => b.textContent === (cat || 'All'))?.classList.add('active');
if (location.hash.startsWith('#/user')) renderUser();
}

function render() {
$('#year').textContent = new Date().getFullYear();
load();
const route = location.hash || '#/landing';
if (route.startsWith('#/landing')) return renderLanding();
if (route.startsWith('#/signin')) return renderSignIn();
if (route.startsWith('#/signup')) return renderSignUp();
if (!state.currentUser) return navigate('#/signin');
ensureNavbar();
if (route.startsWith('#/user')) return renderUser();
if (route.startsWith('#/tutor')) return renderTutor();
return renderLanding();
}

function renderLanding() {
const app = $('#app');
app.innerHTML = `
<section class="container landing-full">
<div class="landing-bg"></div>
<div class="landing-content">
<div class="landing-name">justy5</div>
<div class="landing-sub">Free chatbot for quick help → fallback to 10–15 min expert sessions.</div>
<div class="landing-cta">
<button class="btn primary" onclick="navigate('#/signin')">Get Started</button>
<button class="btn" onclick="navigate('#/user')">Try Demo</button>
</div>
</div>
</section>
`;
$('#navbar').classList.add('hidden');
}

function renderAuthShell(inner, title, sub) {
return `
<section class="container auth">
<div class="auth-visual">
<div class="phone-frame"><div class="phone-dot"></div></div>
</div>
<div class="auth-card">
<div class="auth-title">${title}</div>
<div class="auth-sub">${sub}</div>
${inner}
</div>
</section>
`;
}

function renderSignIn() {
const app = $('#app');
const inner = `
<div class="auth-actions">
<label>Username or Email</label>
<input id="si_user" class="input" placeholder="username or email" />
<label>Password</label>
<input id="si_pass" type="password" class="input" placeholder="••••••••" />
<label>Role</label>
<select id="si_role" class="input">
<option value="user">User</option>
<option value="tutor">Tutor</option>
</select>
<button class="btn primary" onclick="doSignIn()">Sign In</button>
<button class="btn" onclick="navigate('#/signup')">Create new account</button>
</div>
<div class="auth-footer">Inspired by Instagram auth UX</div>
`;
app.innerHTML = renderAuthShell(inner, 'Sign in to justy5', 'Welcome back');
$('#navbar').classList.add('hidden');
}

function renderSignUp() {
const app = $('#app');
const inner = `
<div class="auth-actions">
<label>Username</label>
<input id="su_user" class="input" placeholder="yourname" />
<label>Password</label>
<input id="su_pass" type="password" class="input" placeholder="••••••••" />
<button class="btn primary" onclick="doSignUp()">Sign Up</button>
<button class="btn" onclick="navigate('#/signin')">I have an account</button>
</div>
<div class="auth-footer">Short and simple like Instagram</div>
`;
app.innerHTML = renderAuthShell(inner, 'Create your justy5 account', 'In 10 seconds');
$('#navbar').classList.add('hidden');
}

function doSignUp() {
const username = $('#su_user').value.trim();
const password = $('#su_pass').value;
if (!username || !password) { alert('Enter username and password'); return; }
if (state.users.some(u => u.username === username)) { alert('Username already exists'); return; }
const user = { id: uid(), username, password, name: username, role: 'user' };
state.users.push(user);
save();
alert('Account created. Please sign in.');
navigate('#/signin');
}

function doSignIn() {
const idOrEmail = $('#si_user').value.trim();
const password = $('#si_pass').value;
const role = $('#si_role').value;
if (!idOrEmail || !password) { alert('Enter username/email and password'); return; }
const user = state.users.find(u => (u.username === idOrEmail || u.email === idOrEmail) && u.password === password) || { id: uid(), username: idOrEmail, name: idOrEmail, role };
state.currentUser = user;
save();
ensureNavbar();
navigate(role === 'user' ? '#/user' : '#/tutor');
}

function matchesQuery(t, q) {
if (!q) return true;
const s = q.toLowerCase();
return (
 t.name.toLowerCase().includes(s) ||
 (t.bio || '').toLowerCase().includes(s) ||
 (t.cats || []).some(c => c.toLowerCase().includes(s))
);
}

function renderUser() {
const app = $('#app');
const tutors = state.tutors
.filter(t => t.available)
.filter(t => !currentCategory || t.cats.includes(currentCategory))
.filter(t => matchesQuery(t, state.query));

app.innerHTML = `
<section class="container grid grid-2">
<div class="card">
<div class="row" style="justify-content:space-between;">
<div class="card-title">Chatbot</div>
<span class="pill warn">Free</span>
</div>
<div class="chat">
<div id="chatWindow" class="chat-window"></div>
<div class="row">
<input id="chatInput" class="input" placeholder="Ask anything... e.g., Why is my JS fetch failing?" />
<button class="btn primary" onclick="sendMsg()">Send</button>
</div>
<div class="small">Tip: Press <span class="kbd">Enter</span> to send.</div>
</div>
</div>
<div class="card">
<div class="row" style="justify-content:space-between; align-items:center;">
<div class="card-title">Available Tutors</div>
<span class="small">Showing ${tutors.length} ${currentCategory ? 'in '+currentCategory : ''}</span>
</div>
<div class="row" style="margin-bottom:8px;">
<div class="search">
<span class="icon">🔎</span>
<input id="tutorSearch" class="input" placeholder="Search tutor by name, skill or bio..." value="${state.query || ''}" />
</div>
</div>
<div class="tutor-list">
${tutors.map(renderTutorCard).join('')}
</div>
</div>
</section>
<section class="container">
<div class="card">
<div class="card-title">Your Bookings</div>
<div id="myBookings"></div>
</div>
</section>

<div id="modalRoot" class="modal-backdrop"></div>
`;

$('#tutorSearch').addEventListener('input', (e) => { state.query = e.target.value; renderUser(); });
renderMyBookings();
initChatbot();
}

function renderTutorCard(t) {
const img = t.img ? `<img src="${t.img}" alt="${t.name}" onerror="this.style.display='none'"/>` : '';
const fallback = !t.img ? t.name.slice(0,1) : '';
return `
<div class="card tutor">
<div class="head">
<div class="avatar">${img || fallback}</div>
<div>
<div style="font-weight:600;">${t.name}</div>
<div class="small">${t.bio}</div>
</div>
</div>
<div class="row">
${t.cats.map(c => `<span class=\"pill gray\">${c}</span>`).join('')}
</div>
<div class="row" style="justify-content:space-between;">
<div class="price">₹${t.price.toFixed(0)} / 15 min</div>
<button class="btn primary" onclick="openBook('${t.id}')">Book</button>
</div>
</div>
`;
}

function renderMyBookings() {
const mine = state.bookings.filter(b => b.userId === state.currentUser?.id);
const el = $('#myBookings');
if (!mine.length) { el.innerHTML = `<div class="small">No bookings yet.</div>`; return; }
el.innerHTML = mine.map(b => `
<div class="card" style="margin-bottom:8px;">
<div class="row" style="justify-content:space-between;">
<div>
<div style="font-weight:600;">Session with ${getTutor(b.tutorId)?.name || 'Tutor'}</div>
<div class="small">${fmtTime(b.startAtISO)} • ${b.minutes} min • ₹${b.price.toFixed(0)}</div>
</div>
<div class="row">
<a class="btn" href="${b.roomUrl}" target="_blank" rel="noopener">Join</a>
</div>
</div>
</div>
`).join('');
}

function getTutor(id) { return state.tutors.find(t => t.id === id); }

function openBook(tutorId) {
const t = getTutor(tutorId);
const modal = $('#modalRoot');
modal.className = 'modal-backdrop show';
modal.innerHTML = `
<div class="modal">
<div class="card-title">Book ${t.name}</div>
<label>Duration</label>
<select id="minutes">
<option value="10">10 minutes</option>
<option value="15" selected>15 minutes</option>
<option value="20">20 minutes</option>
</select>
<label style="margin-top:8px;">Start Time</label>
<input id="startAt" class="input" type="datetime-local" />
<hr class="sep"/>
<div class="row" style="justify-content:space-between;">
<div class="small">Total</div>
<div id="total" class="price">₹${t.price.toFixed(0)}</div>
</div>
<div class="row" style="justify-content:flex-end; margin-top:10px;">
<button class="btn" onclick="closeModal()">Cancel</button>
<button class="btn primary" onclick="mockPay('${t.id}')">Pay & Book</button>
</div>
</div>
`;
const minutesSel = $('#minutes');
const totalEl = $('#total');
const updateTotal = () => {
const mins = +minutesSel.value;
const factor = mins / 15;
const total = Math.round(t.price * factor);
totalEl.textContent = `₹${total}`;
};
minutesSel.onchange = updateTotal;
updateTotal();
}

function closeModal() {
const modal = $('#modalRoot');
modal.className = 'modal-backdrop';
modal.innerHTML = '';
}

function mockPay(tutorId) {
const t = getTutor(tutorId);
const mins = +$('#minutes').value || 15;
const startAt = $('#startAt').value ? new Date($('#startAt').value).toISOString() : new Date(Date.now()+2*60*1000).toISOString();
const price = +$('#total').textContent.replace('₹','');
const roomUrl = jitRoom();

const modal = $('#modalRoot');
modal.innerHTML = `
<div class="modal">
<div class="row" style="justify-content:space-between;">
<div class="card-title">Processing Payment</div>
<span class="pill warn">Mock</span>
</div>
<p class="small">Confirming… This simulates a payment gateway.</p>
<div class="row" style="justify-content:flex-end;">
<button class="btn ghost" onclick="closeModal()">Close</button>
</div>
</div>
`;
setTimeout(() => {
const booking = { id: uid(), userId: state.currentUser.id, tutorId: t.id, minutes: mins, startAtISO: startAt, price, roomUrl };
state.bookings.push(booking);
save();
closeModal();
renderMyBookings();
alert('Payment successful. Booking created. You can Join the session from "Your Bookings".');
}, 1200);
}

function initChatbot() {
const input = $('#chatInput');
const win = $('#chatWindow');
const welcome = [
{role: 'bot', text: 'Hi! Ask me a quick question. If I can’t solve it, I’ll show available tutors.'}
];
welcome.forEach(m => addMsg(win, m.role, m.text));
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMsg(); });
}

function sendMsg() {
const input = $('#chatInput');
const text = input.value.trim();
if (!text) return;
const win = $('#chatWindow');
addMsg(win, 'user', text);
input.value = '';
setTimeout(() => {
const {answer, confidence} = botAnswer(text);
addMsg(win, 'bot', answer + (confidence < 0.5 ? '\n\nNeed more help? Book an expert from the right →' : ''));
if (confidence < 0.3) {
const cat = guessCategory(text);
if (cat) filterByCategory(cat);
}
}, 450);
win.scrollTop = win.scrollHeight;
}

function addMsg(win, role, text) {
const div = document.createElement('div');
div.className = `msg ${role}`;
div.textContent = text;
win.appendChild(div);
win.scrollTop = win.scrollHeight;
}

function botAnswer(q) {
const lc = q.toLowerCase();
if (lc.includes('resume') || lc.includes('cv')) return {answer: 'Use action bullets with metrics. Keep to 1 page if <10 yrs exp. Keywords must match the JD.', confidence: 0.6};
if (lc.includes('time complexity') || lc.includes('big o')) return {answer: 'Time complexity depends on loops and data structures. Share code for a tighter bound.', confidence: 0.55};
if (lc.includes('fetch') && lc.includes('error')) return {answer: 'Common fetch issues: CORS, wrong URL, or not awaiting response.json(). Check Network tab.', confidence: 0.5};
if (lc.includes('react') && lc.includes('state')) return {answer: 'Keep state minimal; avoid direct mutation. Use setState callbacks.', confidence: 0.5};
return {answer: 'Not fully sure. Add more context, or consider a quick 15-min session with a tutor.', confidence: 0.2};
}

function guessCategory(q) {
const lc = q.toLowerCase();
if (lc.includes('resume') || lc.includes('cv')) return 'Resume';
if (lc.includes('dsa') || lc.includes('complexity') || lc.includes('array') || lc.includes('tree')) return 'DSA';
if (lc.includes('react') || lc.includes('css') || lc.includes('frontend')) return 'Frontend';
if (lc.includes('api') || lc.includes('node') || lc.includes('backend')) return 'Backend';
if (lc.includes('ml') || lc.includes('machine learning') || lc.includes('ai')) return 'ML/AI';
if (lc.includes('career') || lc.includes('interview')) return 'Career';
return null;
}

function renderTutor() {
const app = $('#app');
let tutor = state.tutors.find(t => t.ownerId === state.currentUser?.id);
if (!tutor) {
tutor = { id: uid(), ownerId: state.currentUser.id, name: state.currentUser.name, cats: ['DSA'], price: 79, available: true, bio: 'Helpful and concise.', img: `https://ui-avatars.com/api/?name=${encodeURIComponent(state.currentUser.name||'Tutor')}&background=1f2937&color=60a5fa&rounded=true` };
state.tutors.push(tutor);
save();
}
const myBookings = state.bookings.filter(b => b.tutorId === tutor.id);

app.innerHTML = `
<section class="container grid" style="grid-template-columns: 1fr 1fr;">
<div class="card">
<div class="card-title">Availability</div>
<div class="row">
<label class="pill">${tutor.available ? 'Available' : 'Unavailable'}</label>
<button class="btn" onclick="toggleAvail('${tutor.id}')">${tutor.available ? 'Go Offline' : 'Go Online'}</button>
</div>
<hr class="sep"/>
<label>Categories</label>
<div class="row" style="gap:6px; flex-wrap:wrap;" id="tutorCats">
${state.categories.map(c => `
<button class=\"category-btn ${tutor.cats.includes(c) ? 'active' : ''}\" onclick=\"toggleCat('${tutor.id}','${c}')\">${c}</button>
`).join('')}
</div>
<label style="margin-top:10px;">Price (₹ per 15 min)</label>
<input id="price" class="input" type="number" min="20" step="5" value="${tutor.price}" />
<label style="margin-top:10px;">Short Bio</label>
<textarea id="bio" class="input" rows="3">${tutor.bio}</textarea>
<div class="row" style="justify-content:flex-end; margin-top:10px;">
<button class="btn primary" onclick="saveTutor('${tutor.id}')">Save</button>
</div>
</div>
<div class="card">
<div class="row" style="justify-content:space-between;">
<div class="card-title">Upcoming Sessions</div>
<span class="small">${myBookings.length}</span>
</div>
<div id="tutorBookings">
${myBookings.length ? myBookings.map(b => `
<div class=\"card\" style=\"margin-bottom:8px;\">
<div class=\"row\" style=\"justify-content:space-between;\">
<div>
<div style=\"font-weight:600;\">With ${getUserName(b.userId)}</div>
<div class=\"small\">${fmtTime(b.startAtISO)} • ${b.minutes} min • ₹${b.price.toFixed(0)}</div>
</div>
<div class=\"row\">
<a class=\"btn\" href=\"${b.roomUrl}\" target=\"_blank\">Join</a>
</div>
</div>
</div>
`).join('') : '<div class="small">No upcoming sessions.</div>'}
</div>
</div>
</section>
`;
}

function toggleAvail(tutorId) {
const t = state.tutors.find(x => x.id === tutorId);
t.available = !t.available;
save();
renderTutor();
}

function toggleCat(tutorId, cat) {
const t = state.tutors.find(x => x.id === tutorId);
const i = t.cats.indexOf(cat);
if (i >= 0) t.cats.splice(i,1); else t.cats.push(cat);
save();
renderTutor();
}

function saveTutor(tutorId) {
const t = state.tutors.find(x => x.id === tutorId);
t.price = Math.max(20, parseFloat($('#price').value) || t.price);
t.bio = ($('#bio').value || '').slice(0, 140);
save();
alert('Saved.');
}

function getUserName(userId) {
if (state.currentUser?.id === userId) return state.currentUser.name;
return 'User';
}

window.addEventListener('hashchange', render);
window.addEventListener('load', () => { render(); });

window.navigate = navigate;
window.logout = logout;
window.switchRole = switchRole;
window.openBook = openBook;
window.closeModal = closeModal;
window.mockPay = mockPay;
window.doSignUp = doSignUp;
window.doSignIn = doSignIn;
window.sendMsg = sendMsg;
