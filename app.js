// Configuration & State
const AVATARS = {
    salmon: `<svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="55" width="70" height="25" rx="12" fill="#ffffff" stroke="#333" stroke-width="3" />
                <g class="topping">
                    <path d="M 10 55 C 10 30 90 30 90 55 C 95 65 5 65 10 55 Z" fill="#ff7b54" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
                    <path d="M 30 38 Q 28 48 25 58" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
                    <path d="M 50 35 Q 48 48 45 58" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
                    <path d="M 70 38 Q 68 48 65 58" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
                </g>
                <g class="eyes"><circle cx="35" cy="65" r="4.5" fill="#333" /><circle cx="36" cy="64" r="1.5" fill="#fff" /><circle cx="65" cy="65" r="4.5" fill="#333" /><circle cx="66" cy="64" r="1.5" fill="#fff" /></g>
                <ellipse cx="25" cy="69" rx="5" ry="2.5" fill="#ffb3c6" /><ellipse cx="75" cy="69" rx="5" ry="2.5" fill="#ffb3c6" />
                <path d="M 45 66 Q 47.5 71 50 66 Q 52.5 71 55 66" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
            </svg>`,
    tamago: `<svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="55" width="70" height="25" rx="12" fill="#ffffff" stroke="#333" stroke-width="3" />
                <g class="topping">
                    <path d="M 12 50 C 12 30 88 30 88 50 C 95 60 5 60 12 50 Z" fill="#ffd166" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
                    <rect x="42" y="32" width="16" height="42" fill="#2d3436" stroke="#333" stroke-width="2"/>
                </g>
                <g class="eyes"><circle cx="35" cy="65" r="4.5" fill="#333" /><circle cx="36" cy="64" r="1.5" fill="#fff" /><circle cx="65" cy="65" r="4.5" fill="#333" /><circle cx="66" cy="64" r="1.5" fill="#fff" /></g>
                <ellipse cx="25" cy="69" rx="5" ry="2.5" fill="#ffb3c6" /><ellipse cx="75" cy="69" rx="5" ry="2.5" fill="#ffb3c6" />
                <path d="M 45 66 Q 47.5 71 50 66 Q 52.5 71 55 66" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
            </svg>`,
    onigiri: `<svg width="80" height="80" viewBox="0 15 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50 15 C 25 15 15 50 15 70 C 15 90 85 90 85 70 C 85 50 75 15 50 15 Z" fill="#ffffff" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
                <g class="onigiri-wrapper">
                    <path d="M 30 85 C 30 65 70 65 70 85 C 70 95 30 95 30 85 Z" fill="#2d3436" stroke="#333" stroke-width="2"/>
                </g>
                <g class="eyes"><circle cx="35" cy="55" r="4.5" fill="#333" /><circle cx="36" cy="54" r="1.5" fill="#fff" /><circle cx="65" cy="55" r="4.5" fill="#333" /><circle cx="66" cy="54" r="1.5" fill="#fff" /></g>
                <path d="M 45 60 Q 50 65 55 60" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
                <g class="blush">
                    <ellipse cx="25" cy="59" rx="5" ry="2.5" fill="#ffb3c6" /><ellipse cx="75" cy="59" rx="5" ry="2.5" fill="#ffb3c6" />
                </g>
            </svg>`
};

const state = {
    isHost: false,
    peer: null,
    conn: null, // Data channel
    mediaCall: null, // Media connection
    myId: null,
    remoteId: null,
    localStream: null,
    remoteStream: null,
    localX: 50, // Percentages
    localY: 50,
    throttleTimeout: null,
    myAvatar: 'salmon',
    remoteAvatar: 'tamago'
};

const keyState = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// UI Elements Map
const UI = {
    views: {
        setup: document.getElementById('setup-view'),
        workspace: document.getElementById('workspace-view')
    },
    setup: {
        btnCreate: document.getElementById('btn-create'),
        btnJoin: document.getElementById('btn-join'),
        inputRoom: document.getElementById('input-room-id'),
        status: document.getElementById('setup-status')
    },
    workspace: {
        roomId: document.getElementById('display-room-id'),
        btnCopy: document.getElementById('btn-copy'),
        btnShare: document.getElementById('btn-share'),
        btnLeave: document.getElementById('btn-leave'),
        btnToggleChat: document.getElementById('btn-toggle-chat'),
        indicator: document.getElementById('connection-indicator'),
        video: document.getElementById('media-video'),
        placeholder: document.getElementById('media-placeholder'),
        placeholderText: document.getElementById('placeholder-text')
    },
    chat: {
        sidebar: document.getElementById('chat-sidebar'),
        header: document.querySelector('.chat-header'),
        btnClose: document.getElementById('btn-close-chat'),
        container: document.getElementById('chat-messages'),
        input: document.getElementById('chat-input'),
        btnSend: document.getElementById('btn-send')
    },
    avatars: {
        local: document.getElementById('local-avatar'),
        remote: document.getElementById('remote-avatar')
    },
    modal: {
        overlay: document.getElementById('confirm-modal'),
        btnConfirm: document.getElementById('btn-modal-confirm'),
        btnCancel: document.getElementById('btn-modal-cancel')
    }
};

// --- Initialization ---
function init() {
    UI.avatars.local.style.left = `50vw`;
    UI.avatars.local.style.top = `50vh`;
    UI.avatars.remote.style.left = `50vw`;
    UI.avatars.remote.style.top = `50vh`;

    bindEvents();
    checkForUrlRoom();
}

function bindEvents() {
    UI.setup.btnCreate.addEventListener('click', createRoom);
    UI.setup.btnJoin.addEventListener('click', () => joinRoom(UI.setup.inputRoom.value.trim()));
    UI.workspace.btnCopy.addEventListener('click', copyInviteLink);
    UI.workspace.btnShare.addEventListener('click', toggleScreenShare);
    
    UI.workspace.btnLeave.addEventListener('click', () => {
        UI.modal.overlay.classList.remove('hidden');
    });
    UI.modal.btnCancel.addEventListener('click', () => {
        UI.modal.overlay.classList.add('hidden');
    });
    UI.modal.btnConfirm.addEventListener('click', () => {
        UI.modal.overlay.classList.add('hidden');
        leaveRoom();
    });

    UI.workspace.btnToggleChat.addEventListener('click', () => UI.chat.sidebar.classList.toggle('hidden-sidebar'));
    
    // Chat events
    UI.chat.btnClose.addEventListener('click', () => UI.chat.sidebar.classList.add('hidden-sidebar'));
    UI.chat.btnSend.addEventListener('click', sendChatMessage);
    UI.chat.input.addEventListener('keydown', (e) => {
        // Send on Enter (but add newline on Shift + Enter)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    
    // Auto-expand textarea
    UI.chat.input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Avatar keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Make chat draggable
    makeDraggable(UI.chat.sidebar, UI.chat.header);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// --- Draggable Utility ---
function makeDraggable(element, handle) {
    let isDragging = false;
    let offsetX, offsetY;

    handle.style.cursor = 'grab';

    handle.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return; // Ignore close button clicks
        
        isDragging = true;
        handle.style.cursor = 'grabbing';
        
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Remove bottom/right positioning to rely purely on top/left
        element.style.bottom = 'auto';
        element.style.right = 'auto';
        element.style.left = `${rect.left}px`;
        element.style.top = `${rect.top}px`;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        
        // Bound to window
        newX = Math.max(0, Math.min(newX, window.innerWidth - element.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - element.offsetHeight));
        
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        handle.style.cursor = 'grab';
    });
}

function checkForUrlRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    const peerId = urlParams.get('room');
    if (peerId) {
        UI.setup.inputRoom.value = peerId;
        // Optionally auto-join:
        // joinRoom(peerId);
        setStatus("Found room ID from URL. Click Join Room to connect.");
    }
}

// --- PeerJS Logic ---

function getSelectedAvatar() {
    const checked = document.querySelector('input[name="avatar"]:checked');
    return checked ? checked.value : 'salmon';
}

function createRoom() {
    state.isHost = true;
    state.myAvatar = getSelectedAvatar();
    UI.avatars.local.querySelector('.sushi-inner').innerHTML = AVATARS[state.myAvatar];

    setStatus("Connecting to signaling server...");
    
    state.peer = new Peer({
        // Uses default free public PeerJS server
        debug: 2
    });

    state.peer.on('open', (id) => {
        state.myId = id;
        transitionToWorkspace();
        UI.workspace.roomId.textContent = id;
        addSystemMessage(`Room created! Share this ID or the invite link to connect.`);
        UI.workspace.btnShare.classList.remove('hidden'); // Host can share
    });

    state.peer.on('connection', (conn) => {
        if (state.conn) {
            conn.close(); // Only allow one guest for a 1-to-1 session
            return;
        }
        setupDataConnection(conn);
    });

    // When the guest calls us to request the stream (if available) or connect media
    state.peer.on('call', handleIncomingCall);

    handlePeerErrors();
}

function joinRoom(peerId) {
    if (!peerId) {
        setStatus("Please enter a Room ID or link.");
        return;
    }
    
    // Extract ID if a full link was pasted
    if (peerId.includes('?room=')) {
        peerId = new URL(peerId).searchParams.get('room');
    }

    state.isHost = false;
    state.remoteId = peerId;
    state.myAvatar = getSelectedAvatar();
    UI.avatars.local.querySelector('.sushi-inner').innerHTML = AVATARS[state.myAvatar];
    
    setStatus("Connecting to signaling server...");
    
    state.peer = new Peer({ debug: 2 });

    state.peer.on('open', (id) => {
        state.myId = id;
        setStatus("Connecting to host...");
        const conn = state.peer.connect(peerId);
        setupDataConnection(conn);
        transitionToWorkspace();
        UI.workspace.roomId.textContent = peerId;
    });

    state.peer.on('call', handleIncomingCall);
    handlePeerErrors();
}

function setupDataConnection(conn) {
    state.conn = conn;

    const onOpen = () => {
        setStatus("");
        UI.workspace.indicator.classList.replace('offline', 'online');
        UI.workspace.indicator.title = "Online";
        
        UI.chat.input.disabled = false;
        UI.chat.btnSend.disabled = false;
        
        addSystemMessage(state.isHost ? "Guest joined the room!" : "Connected to the room!");
        
        // Tell remote peer what avatar to display for us
        state.conn.send(JSON.stringify({ type: 'init', avatar: state.myAvatar }));

        // Show remote avatar piece
        UI.avatars.remote.classList.remove('hidden');

        // If Host already has a stream, call the guest now
        if (state.isHost && state.localStream) {
            makeMediaCall(conn.peer, state.localStream);
        }
    };

    if (conn.open) {
        onOpen();
    } else {
        conn.on('open', onOpen);
    }

    conn.on('data', handleIncomingData);

    conn.on('close', () => {
        handleDisconnection();
    });
}

function handlePeerErrors() {
    state.peer.on('error', (err) => {
        console.error(err);
        setStatus("Error: " + err.message);
        if (err.type === 'peer-unavailable') {
            addSystemMessage("Connection failed. Host might be disconnected or room ID is invalid.");
            handleDisconnection();
        }
    });
}

// --- Data Channel Multiplexing ---

// --- Cursor Sync & Avatars ---

function handleKeyDown(e) {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    if (keyState.hasOwnProperty(e.key)) {
        e.preventDefault();
        keyState[e.key] = true;
    }
}

function handleKeyUp(e) {
    if (keyState.hasOwnProperty(e.key)) {
        keyState[e.key] = false;
    }
}

let lastBroadcastMovedState = false;

function gameLoop() {
    let moved = false;
    const step = 0.5; // Smooth 60fps movement

    if (keyState.ArrowUp) { state.localY = Math.max(0, state.localY - step); moved = true; UI.avatars.local.classList.add('moving-up'); } else { UI.avatars.local.classList.remove('moving-up'); }
    if (keyState.ArrowDown) { state.localY = Math.min(100, state.localY + step); moved = true; UI.avatars.local.classList.add('moving-down'); } else { UI.avatars.local.classList.remove('moving-down'); }
    if (keyState.ArrowLeft) { state.localX = Math.max(0, state.localX - step); moved = true; UI.avatars.local.classList.add('moving-left'); } else { UI.avatars.local.classList.remove('moving-left'); }
    if (keyState.ArrowRight) { state.localX = Math.min(100, state.localX + step); moved = true; UI.avatars.local.classList.add('moving-right'); } else { UI.avatars.local.classList.remove('moving-right'); }

    if (moved) {
        UI.avatars.local.classList.add('bouncing');
        UI.avatars.local.style.left = `${state.localX}vw`;
        UI.avatars.local.style.top = `${state.localY}vh`;
    } else {
        UI.avatars.local.classList.remove('bouncing');
    }

    if (moved || lastBroadcastMovedState) {
        if (!state.throttleTimeout && state.conn && state.conn.open) {
            state.throttleTimeout = setTimeout(() => {
                const activeClasses = Array.from(UI.avatars.local.classList).filter(c => c.startsWith('moving-') || c === 'bouncing');
                state.conn.send(JSON.stringify({
                    type: 'cursor',
                    x: state.localX,
                    y: state.localY,
                    classes: activeClasses
                }));
                state.throttleTimeout = null;
            }, 30);
        }
    }
    lastBroadcastMovedState = moved;

    requestAnimationFrame(gameLoop);
}

function updateRemoteCursor(pcX, pcY, classes = []) {
    UI.avatars.remote.style.left = `${pcX}vw`;
    UI.avatars.remote.style.top = `${pcY}vh`;
    
    // Clear and re-apply classes
    UI.avatars.remote.className = 'avatar remote';
    if (classes && classes.length > 0) {
        UI.avatars.remote.classList.add(...classes);
    }
}

function handleIncomingData(data) {
    try {
        const payload = JSON.parse(data);
        if (payload.type === 'init') {
            state.remoteAvatar = payload.avatar || 'tamago';
            UI.avatars.remote.querySelector('.sushi-inner').innerHTML = AVATARS[state.remoteAvatar];
        } else if (payload.type === 'chat') {
            addMessage(payload.text, 'remote');
            showChatBubble(UI.avatars.remote, payload.text);
        } else if (payload.type === 'cursor') {
            updateRemoteCursor(payload.x, payload.y, payload.classes);
        }
    } catch (e) {
        console.warn("Received malformed data:", data);
    }
}

// --- Chat Logic ---
function showChatBubble(avatarElement, text) {
    let container = avatarElement.querySelector('.chat-bubble-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'chat-bubble-container';
        // Prepend it so it sits behind or properly positioned above the DOM layers
        avatarElement.insertBefore(container, avatarElement.firstChild);
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    
    // Limits: Max 3 bubbles at a time so screen doesn't get flooded
    if (container.children.length >= 3) {
        container.removeChild(container.firstChild); // remove oldest bubble
    }

    container.appendChild(bubble);

    // Natural disappearing after 5 seconds
    setTimeout(() => {
        bubble.classList.add('fading');
        setTimeout(() => {
            if (bubble.parentElement) bubble.remove();
        }, 500); // Wait for CSS opacity finish
    }, 5000);
}

function sendChatMessage() {
    const text = UI.chat.input.value.trim();
    if (!text) return;

    if (!state.conn) {
        addSystemMessage("Waiting for someone to join before you can chat!");
        return;
    }

    if (!state.conn.open) {
        addSystemMessage("Connecting... please wait a moment.");
        return;
    }

    try {
        // Render locally
        addMessage(text, 'local');
        showChatBubble(UI.avatars.local, text);
        
        // Send over data channel
        state.conn.send(JSON.stringify({ type: 'chat', text }));
        
        UI.chat.input.value = '';
        UI.chat.input.style.height = 'auto'; // Reset size after sending
    } catch (e) {
        console.error("Failed to send message:", e);
        addSystemMessage("Failed to send message: Connection might have dropped.");
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.textContent = text;
    UI.chat.container.appendChild(div);
    scrollToBottom(UI.chat.container);
}

function addSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'message system';
    div.textContent = text;
    UI.chat.container.appendChild(div);
    scrollToBottom(UI.chat.container);
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// --- Media & Screen Share ---
async function toggleScreenShare() {
    if (state.localStream) {
        // Stop sharing
        state.localStream.getTracks().forEach(track => track.stop());
        state.localStream = null;
        if (state.mediaCall) {
            state.mediaCall.close();
            state.mediaCall = null;
        }
        UI.workspace.video.srcObject = null;
        UI.workspace.video.classList.add('hidden');
        UI.workspace.placeholder.classList.remove('hidden');
        UI.workspace.btnShare.textContent = "Share Screen";
        UI.workspace.btnShare.classList.remove('secondary-btn');
        UI.workspace.btnShare.classList.add('primary-btn');
        // Notify guest maybe via data channel if needed, else stream track ends
        if (state.conn && state.conn.open) {
             state.conn.send(JSON.stringify({type:'chat', text:'Screen sharing stopped.'}));
             addSystemMessage("Screen sharing stopped.");
        }
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always",
                displaySurface: "monitor"
            },
            audio: true
        });

        state.localStream = stream;
        UI.workspace.video.srcObject = stream;
        UI.workspace.placeholder.classList.add('hidden');
        UI.workspace.video.classList.remove('hidden');
        
        UI.workspace.btnShare.textContent = "Stop Sharing";
        UI.workspace.btnShare.classList.remove('primary-btn');
        UI.workspace.btnShare.classList.add('secondary-btn');

        stream.getVideoTracks()[0].onended = () => {
             toggleScreenShare(); // Handle external stop via browser UI
        };

        // If we have a connected peer, call them now
        if (state.conn && state.conn.open) {
            makeMediaCall(state.conn.peer, stream);
        }

    } catch (err) {
        console.error("Error accessing display media.", err);
        addSystemMessage("Failed to share screen. Permission denied?");
    }
}

function makeMediaCall(remotePeerId, stream) {
    state.mediaCall = state.peer.call(remotePeerId, stream);
    handleMediaCallEvents(state.mediaCall);
}

function handleIncomingCall(call) {
    state.mediaCall = call;
    // We are receiving the video (usually the guest)
    call.answer(null); // Answer without sending stream
    handleMediaCallEvents(call);
}

function handleMediaCallEvents(call) {
    call.on('stream', (remoteStream) => {
        state.remoteStream = remoteStream;
        UI.workspace.video.srcObject = remoteStream;
        UI.workspace.placeholder.classList.add('hidden');
        UI.workspace.video.classList.remove('hidden');
    });

    call.on('close', () => {
        state.remoteStream = null;
        UI.workspace.video.srcObject = null;
        UI.workspace.placeholder.classList.remove('hidden');
        UI.workspace.video.classList.add('hidden');
    });
}
// --- UI Helpers ---

function setStatus(msg) {
    UI.setup.status.textContent = msg;
}

function transitionToWorkspace() {
    UI.views.setup.classList.remove('active');
    UI.views.setup.classList.add('hidden');
    UI.views.workspace.classList.remove('hidden');
    UI.views.workspace.classList.add('active', 'fade-in');
}

function leaveRoom() {
    // 1. Clean up screen share
    if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
        state.localStream = null;
    }
    
    // 2. Clean up media call
    if (state.mediaCall) {
        state.mediaCall.close();
        state.mediaCall = null;
    }

    // 3. Clean up data connection
    if (state.conn) {
        state.conn.close();
        state.conn = null;
    }

    // 4. Clean up PeerJS instance
    if (state.peer) {
        state.peer.destroy();
        state.peer = null;
    }

    // 5. Reset UI Elements
    UI.chat.container.innerHTML = '';
    UI.workspace.video.srcObject = null;
    UI.workspace.video.classList.add('hidden');
    UI.workspace.placeholder.classList.remove('hidden');
    UI.workspace.btnShare.classList.add('hidden');
    UI.workspace.indicator.classList.replace('online', 'offline');
    UI.workspace.indicator.title = "Offline";
    UI.chat.input.disabled = true;
    UI.chat.btnSend.disabled = true;
    UI.avatars.remote.classList.add('hidden');

    // 6. Transition to Setup View
    UI.views.workspace.classList.remove('active', 'fade-in');
    UI.views.workspace.classList.add('hidden');
    UI.views.setup.classList.remove('hidden');
    UI.views.setup.classList.add('active');
    
    setStatus("You left the room.");
    
    // Reset state flags
    state.isHost = false;
    state.remoteId = null;
}

function copyInviteLink() {
    const url = new URL(window.location.href);
    url.searchParams.set('room', state.myId || UI.workspace.roomId.textContent);
    navigator.clipboard.writeText(url.toString()).then(() => {
        const originalText = UI.workspace.btnCopy.textContent;
        UI.workspace.btnCopy.textContent = "✅";
        setTimeout(() => UI.workspace.btnCopy.textContent = originalText, 2000);
    });
}

function handleDisconnection() {
    UI.workspace.indicator.classList.replace('online', 'offline');
    UI.workspace.indicator.title = "Offline";
    UI.chat.input.disabled = true;
    UI.chat.btnSend.disabled = true;
    addSystemMessage("Connection lost. Peer disconnected.");
    UI.avatars.remote.classList.add('hidden');
    
    if (state.remoteStream) {
        UI.workspace.video.srcObject = null;
        UI.workspace.placeholder.classList.remove('hidden');
    }
}

// Start app
init();
