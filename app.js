// ==========================================
// Configuration & Constants
// ==========================================

const PEER_CONFIG = {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            // Free TURN relay servers (Metered.ca Open Relay) for NAT traversal
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turns:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
        ]
    },
    debug: 1
};

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

// ==========================================
// State (Multi-User Mesh)
// ==========================================

const state = {
    isHost: false,
    peer: null,
    peers: new Map(), // peerId → { conn, mediaCallOut, mediaCallIn, audioCallOut, audioCallIn, avatar, x, y, avatarEl }
    myId: null,
    hostId: null,
    localStream: null,       // Screen share stream
    localAudioStream: null,  // Microphone stream
    isMicMuted: false,
    localX: 50,
    localY: 50,
    throttleTimeout: null,
    myAvatar: 'salmon'
};

const keyState = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// ==========================================
// UI Elements Map
// ==========================================

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
        btnToggleMic: document.getElementById('btn-toggle-mic'),
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
        local: document.getElementById('local-avatar')
    },
    modal: {
        overlay: document.getElementById('confirm-modal'),
        btnConfirm: document.getElementById('btn-modal-confirm'),
        btnCancel: document.getElementById('btn-modal-cancel')
    }
};

// ==========================================
// Initialization
// ==========================================

function init() {
    UI.avatars.local.style.left = '50vw';
    UI.avatars.local.style.top = '50vh';
    bindEvents();
    checkForUrlRoom();
}

function bindEvents() {
    UI.setup.btnCreate.addEventListener('click', createRoom);
    UI.setup.btnJoin.addEventListener('click', () => joinRoom(UI.setup.inputRoom.value.trim()));
    UI.workspace.btnCopy.addEventListener('click', copyInviteLink);
    UI.workspace.btnShare.addEventListener('click', toggleScreenShare);
    UI.workspace.btnToggleMic.addEventListener('click', toggleMicrophone);

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
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Auto-expand textarea
    UI.chat.input.addEventListener('input', function () {
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

// ==========================================
// Draggable Utility
// ==========================================

function makeDraggable(element, handle) {
    let isDragging = false;
    let offsetX, offsetY;

    handle.style.cursor = 'grab';

    handle.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        handle.style.cursor = 'grabbing';

        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        element.style.bottom = 'auto';
        element.style.right = 'auto';
        element.style.left = `${rect.left}px`;
        element.style.top = `${rect.top}px`;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
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
        setStatus("Found room ID from URL. Click Join Room to connect.");
    }
}

// ==========================================
// PeerJS Logic
// ==========================================

function getSelectedAvatar() {
    const checked = document.querySelector('input[name="avatar"]:checked');
    return checked ? checked.value : 'salmon';
}

function createRoom() {
    state.isHost = true;
    state.myAvatar = getSelectedAvatar();
    UI.avatars.local.querySelector('.sushi-inner').innerHTML = AVATARS[state.myAvatar];
    setStatus("Connecting to signaling server...");

    state.peer = new Peer(PEER_CONFIG);

    state.peer.on('open', (id) => {
        state.myId = id;
        state.hostId = id;
        transitionToWorkspace();
        UI.workspace.roomId.textContent = id;
        addSystemMessage('Room created! Share this ID or the invite link to connect.');
    });

    // Accept ALL incoming connections (multi-user)
    state.peer.on('connection', (conn) => {
        setupDataConnection(conn, true);
    });

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
        try { peerId = new URL(peerId).searchParams.get('room'); } catch (e) { /* use as-is */ }
    }

    state.isHost = false;
    state.hostId = peerId;
    state.myAvatar = getSelectedAvatar();
    UI.avatars.local.querySelector('.sushi-inner').innerHTML = AVATARS[state.myAvatar];
    setStatus("Connecting to signaling server...");

    state.peer = new Peer(PEER_CONFIG);

    state.peer.on('open', (id) => {
        state.myId = id;
        setStatus("Connecting to host...");
        const conn = state.peer.connect(peerId, { reliable: true });
        setupDataConnection(conn, false);
        transitionToWorkspace();
        UI.workspace.roomId.textContent = peerId;
    });

    // Listen for incoming connections from OTHER peers (mesh)
    state.peer.on('connection', (conn) => {
        setupDataConnection(conn, true);
    });

    state.peer.on('call', handleIncomingCall);
    handlePeerErrors();
}

// ==========================================
// Data Connection Management (Multi-Peer)
// ==========================================

function setupDataConnection(conn, isIncoming) {
    const peerId = conn.peer;

    // If we already have a connection to this peer, skip
    if (state.peers.has(peerId)) {
        console.warn(`Already connected to ${peerId}, ignoring duplicate`);
        return;
    }

    // Create peer data entry
    const peerData = {
        conn: conn,
        mediaCallOut: null,
        mediaCallIn: null,
        audioCallOut: null,
        audioCallIn: null,
        avatar: 'tamago',
        x: 50,
        y: 50,
        avatarEl: null
    };
    state.peers.set(peerId, peerData);

    const onOpen = () => {
        updateConnectionStatus();

        // Send our identity
        conn.send(JSON.stringify({ type: 'init', avatar: state.myAvatar }));

        // Create remote avatar for this peer
        peerData.avatarEl = createRemoteAvatar(peerId);

        addSystemMessage(isIncoming ? 'A new user joined!' : 'Connected to a peer!');

        // HOST: send the new peer a list of all OTHER connected peers for mesh
        if (state.isHost && isIncoming) {
            const otherPeerIds = [...state.peers.keys()].filter(id => id !== peerId);
            if (otherPeerIds.length > 0) {
                conn.send(JSON.stringify({ type: 'peer-list', peers: otherPeerIds }));
            }
        }

        // If we're sharing screen, call this new peer
        if (state.localStream) {
            makeMediaCall(peerId, state.localStream);
        }

        // If we have mic enabled, call this new peer with audio
        if (state.localAudioStream) {
            makeAudioCall(peerId, state.localAudioStream);
        }
    };

    if (conn.open) {
        onOpen();
    } else {
        conn.on('open', onOpen);
    }

    conn.on('data', (data) => handleIncomingData(data, peerId));

    conn.on('close', () => {
        removePeer(peerId);
    });

    conn.on('error', (err) => {
        console.error(`Data connection error with ${peerId}:`, err);
        removePeer(peerId);
    });
}

// ==========================================
// Dynamic Avatar Management
// ==========================================

function createRemoteAvatar(peerId) {
    // Remove existing if any (shouldn't happen, but safety)
    removeRemoteAvatar(peerId);

    const avatarEl = document.createElement('div');
    avatarEl.id = `avatar-${peerId}`;
    avatarEl.className = 'avatar remote';
    avatarEl.title = 'Peer';
    avatarEl.style.left = '50vw';
    avatarEl.style.top = '50vh';
    avatarEl.innerHTML = `
        <div class="legs">
            <div class="leg left"></div>
            <div class="leg right"></div>
        </div>
        <div class="sushi-inner"></div>
    `;

    document.body.appendChild(avatarEl);
    return avatarEl;
}

function removeRemoteAvatar(peerId) {
    const el = document.getElementById(`avatar-${peerId}`);
    if (el) el.remove();
}

// ==========================================
// Data Channel Messages
// ==========================================

function handleIncomingData(data, fromPeerId) {
    try {
        const payload = JSON.parse(data);
        const peerData = state.peers.get(fromPeerId);

        if (payload.type === 'init') {
            if (peerData) {
                peerData.avatar = payload.avatar || 'tamago';
                if (peerData.avatarEl) {
                    peerData.avatarEl.querySelector('.sushi-inner').innerHTML = AVATARS[peerData.avatar];
                }
            }

        } else if (payload.type === 'peer-list') {
            // Received from host — connect to each listed peer for mesh
            const peerIds = payload.peers || [];
            peerIds.forEach(pid => {
                if (!state.peers.has(pid) && pid !== state.myId) {
                    const conn = state.peer.connect(pid, { reliable: true });
                    setupDataConnection(conn, false);
                }
            });

        } else if (payload.type === 'chat') {
            addMessage(payload.text, 'remote');
            if (peerData && peerData.avatarEl) {
                showChatBubble(peerData.avatarEl, payload.text);
            }

        } else if (payload.type === 'cursor') {
            updateRemoteCursor(fromPeerId, payload.x, payload.y, payload.classes);
        }
    } catch (e) {
        console.warn("Received malformed data:", data);
    }
}

function broadcastData(payload) {
    const msg = JSON.stringify(payload);
    state.peers.forEach((peerData, peerId) => {
        if (peerData.conn && peerData.conn.open) {
            try {
                peerData.conn.send(msg);
            } catch (e) {
                console.warn(`Failed to send to ${peerId}:`, e);
            }
        }
    });
}

// ==========================================
// Cursor Sync & Avatars
// ==========================================

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
    const step = 0.5;

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
        if (!state.throttleTimeout) {
            state.throttleTimeout = setTimeout(() => {
                state.throttleTimeout = null;
                const activeClasses = Array.from(UI.avatars.local.classList).filter(c => c.startsWith('moving-') || c === 'bouncing');
                broadcastData({
                    type: 'cursor',
                    x: state.localX,
                    y: state.localY,
                    classes: activeClasses
                });
            }, 30);
        }
    }
    lastBroadcastMovedState = moved;

    requestAnimationFrame(gameLoop);
}

function updateRemoteCursor(peerId, pcX, pcY, classes = []) {
    const peerData = state.peers.get(peerId);
    if (!peerData || !peerData.avatarEl) return;

    peerData.x = pcX;
    peerData.y = pcY;
    peerData.avatarEl.style.left = `${pcX}vw`;
    peerData.avatarEl.style.top = `${pcY}vh`;

    // Clear and re-apply classes
    peerData.avatarEl.className = 'avatar remote';
    if (classes && classes.length > 0) {
        peerData.avatarEl.classList.add(...classes);
    }
}

// ==========================================
// Chat Logic
// ==========================================

function showChatBubble(avatarElement, text) {
    let container = avatarElement.querySelector('.chat-bubble-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'chat-bubble-container';
        avatarElement.insertBefore(container, avatarElement.firstChild);
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    if (container.children.length >= 3) {
        container.removeChild(container.firstChild);
    }

    container.appendChild(bubble);

    setTimeout(() => {
        bubble.classList.add('fading');
        setTimeout(() => {
            if (bubble.parentElement) bubble.remove();
        }, 500);
    }, 5000);
}

function sendChatMessage() {
    const text = UI.chat.input.value.trim();
    if (!text) return;

    if (state.peers.size === 0) {
        addSystemMessage("Waiting for someone to join before you can chat!");
        return;
    }

    let anyOpen = false;
    state.peers.forEach(pd => { if (pd.conn && pd.conn.open) anyOpen = true; });
    if (!anyOpen) {
        addSystemMessage("Connecting... please wait a moment.");
        return;
    }

    try {
        addMessage(text, 'local');
        showChatBubble(UI.avatars.local, text);
        broadcastData({ type: 'chat', text });
        UI.chat.input.value = '';
        UI.chat.input.style.height = 'auto';
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

// ==========================================
// Screen Share
// ==========================================

async function toggleScreenShare() {
    if (state.localStream) {
        // Stop sharing
        state.localStream.getTracks().forEach(track => track.stop());
        state.localStream = null;

        // Close all outgoing media calls
        state.peers.forEach((peerData) => {
            if (peerData.mediaCallOut) {
                peerData.mediaCallOut.close();
                peerData.mediaCallOut = null;
            }
        });

        UI.workspace.video.srcObject = null;
        UI.workspace.video.muted = false;
        UI.workspace.video.classList.add('hidden');
        UI.workspace.placeholder.classList.remove('hidden');
        UI.workspace.btnShare.textContent = "Share Screen";
        UI.workspace.btnShare.classList.remove('secondary-btn');
        UI.workspace.btnShare.classList.add('primary-btn');

        broadcastData({ type: 'chat', text: 'Screen sharing stopped.' });
        addSystemMessage("Screen sharing stopped.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always", displaySurface: "monitor" },
            audio: true
        });

        state.localStream = stream;
        UI.workspace.video.srcObject = stream;
        UI.workspace.video.muted = true; // MUTE local playback to prevent audio doubling
        UI.workspace.placeholder.classList.add('hidden');
        UI.workspace.video.classList.remove('hidden');

        UI.workspace.btnShare.textContent = "Stop Sharing";
        UI.workspace.btnShare.classList.remove('primary-btn');
        UI.workspace.btnShare.classList.add('secondary-btn');

        stream.getVideoTracks()[0].onended = () => {
            toggleScreenShare(); // Handle external stop via browser UI
        };

        // Call ALL connected peers with the screen share
        state.peers.forEach((peerData, peerId) => {
            if (peerData.conn && peerData.conn.open) {
                makeMediaCall(peerId, stream);
            }
        });

    } catch (err) {
        console.error("Error accessing display media.", err);
        addSystemMessage("Failed to share screen. Permission denied?");
    }
}

// ==========================================
// Media Calls (Screen Share)
// ==========================================

function makeMediaCall(remotePeerId, stream) {
    const peerData = state.peers.get(remotePeerId);
    if (!peerData) return;

    const call = state.peer.call(remotePeerId, stream, { metadata: { type: 'screen' } });
    peerData.mediaCallOut = call;

    call.on('close', () => {
        if (peerData.mediaCallOut === call) peerData.mediaCallOut = null;
    });
}

// ==========================================
// Audio Calls (Microphone Voice)
// ==========================================

function makeAudioCall(remotePeerId, audioStream) {
    const peerData = state.peers.get(remotePeerId);
    if (!peerData) return;

    // Close any existing outgoing audio call to this peer
    if (peerData.audioCallOut) {
        peerData.audioCallOut.close();
        peerData.audioCallOut = null;
    }

    const call = state.peer.call(remotePeerId, audioStream, { metadata: { type: 'audio' } });
    peerData.audioCallOut = call;

    call.on('close', () => {
        if (peerData.audioCallOut === call) peerData.audioCallOut = null;
    });
}

// ==========================================
// Incoming Call Handler (Routes Screen vs Audio)
// ==========================================

function handleIncomingCall(call) {
    const callType = call.metadata && call.metadata.type;
    const remotePeerId = call.peer;
    const peerData = state.peers.get(remotePeerId);

    if (callType === 'audio') {
        // Incoming voice — just receive (we send our audio via our own outgoing calls)
        call.answer(null);
        if (peerData) peerData.audioCallIn = call;

        call.on('stream', (remoteAudioStream) => {
            playRemoteAudio(remotePeerId, remoteAudioStream);
        });

        call.on('close', () => {
            stopRemoteAudio(remotePeerId);
            if (peerData && peerData.audioCallIn === call) peerData.audioCallIn = null;
        });

    } else {
        // Screen share — receive and display
        call.answer(null);
        if (peerData) peerData.mediaCallIn = call;

        call.on('stream', (remoteStream) => {
            UI.workspace.video.srcObject = remoteStream;
            UI.workspace.video.muted = false; // We want to hear remote's screen audio
            UI.workspace.placeholder.classList.add('hidden');
            UI.workspace.video.classList.remove('hidden');
        });

        call.on('close', () => {
            if (peerData && peerData.mediaCallIn === call) peerData.mediaCallIn = null;

            // Only clear video if no other incoming screen shares
            let hasOtherScreenShare = false;
            state.peers.forEach((pd) => {
                if (pd.mediaCallIn) hasOtherScreenShare = true;
            });
            if (!hasOtherScreenShare && !state.localStream) {
                UI.workspace.video.srcObject = null;
                UI.workspace.placeholder.classList.remove('hidden');
                UI.workspace.video.classList.add('hidden');
            }
        });
    }
}

// ==========================================
// Voice / Microphone
// ==========================================

function playRemoteAudio(peerId, stream) {
    let audioEl = document.getElementById(`audio-${peerId}`);
    if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = `audio-${peerId}`;
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
    }
    audioEl.srcObject = stream;
}

function stopRemoteAudio(peerId) {
    const audioEl = document.getElementById(`audio-${peerId}`);
    if (audioEl) {
        audioEl.srcObject = null;
        audioEl.remove();
    }
}

async function toggleMicrophone() {
    // If mic is already acquired, toggle mute/unmute
    if (state.localAudioStream) {
        const audioTrack = state.localAudioStream.getAudioTracks()[0];
        if (audioTrack) {
            state.isMicMuted = !state.isMicMuted;
            audioTrack.enabled = !state.isMicMuted;

            if (state.isMicMuted) {
                UI.workspace.btnToggleMic.textContent = '🔇';
                UI.workspace.btnToggleMic.classList.remove('mic-active');
                UI.workspace.btnToggleMic.classList.add('mic-muted');
                UI.workspace.btnToggleMic.title = 'Unmute Microphone';
            } else {
                UI.workspace.btnToggleMic.textContent = '🎤';
                UI.workspace.btnToggleMic.classList.remove('mic-muted');
                UI.workspace.btnToggleMic.classList.add('mic-active');
                UI.workspace.btnToggleMic.title = 'Mute Microphone';
            }
        }
        return;
    }

    // First time — request mic access with echo cancellation
    try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        state.localAudioStream = audioStream;
        state.isMicMuted = false;

        UI.workspace.btnToggleMic.textContent = '🎤';
        UI.workspace.btnToggleMic.classList.add('mic-active');
        UI.workspace.btnToggleMic.title = 'Mute Microphone';

        addSystemMessage('Microphone enabled.');

        // Call ALL connected peers with our audio
        state.peers.forEach((peerData, peerId) => {
            if (peerData.conn && peerData.conn.open) {
                makeAudioCall(peerId, audioStream);
            }
        });

    } catch (err) {
        console.error('Microphone access error:', err);
        addSystemMessage('Failed to access microphone. Permission denied?');
    }
}

// ==========================================
// Peer Cleanup
// ==========================================

function removePeer(peerId) {
    const peerData = state.peers.get(peerId);
    if (!peerData) return;

    // Close all calls
    if (peerData.mediaCallOut) { try { peerData.mediaCallOut.close(); } catch (e) {} }
    if (peerData.mediaCallIn) { try { peerData.mediaCallIn.close(); } catch (e) {} }
    if (peerData.audioCallOut) { try { peerData.audioCallOut.close(); } catch (e) {} }
    if (peerData.audioCallIn) { try { peerData.audioCallIn.close(); } catch (e) {} }
    if (peerData.conn && peerData.conn.open) { try { peerData.conn.close(); } catch (e) {} }

    // Remove avatar & audio elements
    removeRemoteAvatar(peerId);
    stopRemoteAudio(peerId);

    // Remove from map
    state.peers.delete(peerId);

    addSystemMessage('A user disconnected.');
    updateConnectionStatus();

    // Check if we lost the screen share source
    let hasScreenShare = false;
    state.peers.forEach((pd) => { if (pd.mediaCallIn) hasScreenShare = true; });
    if (!hasScreenShare && !state.localStream) {
        UI.workspace.video.srcObject = null;
        UI.workspace.placeholder.classList.remove('hidden');
        UI.workspace.video.classList.add('hidden');
    }
}

function updateConnectionStatus() {
    let connectedCount = 0;
    state.peers.forEach(pd => { if (pd.conn && pd.conn.open) connectedCount++; });

    if (connectedCount > 0) {
        UI.workspace.indicator.classList.replace('offline', 'online');
        UI.workspace.indicator.title = `Online (${connectedCount} peer${connectedCount > 1 ? 's' : ''})`;
        UI.chat.input.disabled = false;
        UI.chat.btnSend.disabled = false;
    } else {
        UI.workspace.indicator.classList.replace('online', 'offline');
        UI.workspace.indicator.title = 'Offline';
        UI.chat.input.disabled = true;
        UI.chat.btnSend.disabled = true;
    }
}

// ==========================================
// UI Helpers
// ==========================================

function setStatus(msg) {
    UI.setup.status.textContent = msg;
}

function transitionToWorkspace() {
    UI.views.setup.classList.remove('active');
    UI.views.setup.classList.add('hidden');
    UI.views.workspace.classList.remove('hidden');
    UI.views.workspace.classList.add('active', 'fade-in');
    UI.workspace.btnShare.classList.remove('hidden'); // Show share button for all users
}

function leaveRoom() {
    // 1. Clean up screen share
    if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
        state.localStream = null;
    }

    // 2. Clean up microphone
    if (state.localAudioStream) {
        state.localAudioStream.getTracks().forEach(track => track.stop());
        state.localAudioStream = null;
    }
    state.isMicMuted = false;
    UI.workspace.btnToggleMic.textContent = '🎤';
    UI.workspace.btnToggleMic.classList.remove('mic-active', 'mic-muted');
    UI.workspace.btnToggleMic.title = 'Toggle Microphone';

    // 3. Clean up ALL peer connections
    state.peers.forEach((peerData, peerId) => {
        if (peerData.mediaCallOut) { try { peerData.mediaCallOut.close(); } catch (e) {} }
        if (peerData.mediaCallIn) { try { peerData.mediaCallIn.close(); } catch (e) {} }
        if (peerData.audioCallOut) { try { peerData.audioCallOut.close(); } catch (e) {} }
        if (peerData.audioCallIn) { try { peerData.audioCallIn.close(); } catch (e) {} }
        if (peerData.conn) { try { peerData.conn.close(); } catch (e) {} }
        removeRemoteAvatar(peerId);
        stopRemoteAudio(peerId);
    });
    state.peers.clear();

    // 4. Destroy PeerJS instance
    if (state.peer) {
        state.peer.destroy();
        state.peer = null;
    }

    // 5. Reset UI
    UI.chat.container.innerHTML = '';
    UI.workspace.video.srcObject = null;
    UI.workspace.video.muted = false;
    UI.workspace.video.classList.add('hidden');
    UI.workspace.placeholder.classList.remove('hidden');
    UI.workspace.btnShare.classList.add('hidden');
    UI.workspace.btnShare.textContent = 'Share Screen';
    UI.workspace.btnShare.classList.remove('secondary-btn');
    UI.workspace.btnShare.classList.add('primary-btn');
    UI.workspace.indicator.classList.replace('online', 'offline');
    UI.workspace.indicator.title = 'Offline';
    UI.chat.input.disabled = true;
    UI.chat.btnSend.disabled = true;

    // 6. Transition to Setup
    UI.views.workspace.classList.remove('active', 'fade-in');
    UI.views.workspace.classList.add('hidden');
    UI.views.setup.classList.remove('hidden');
    UI.views.setup.classList.add('active');

    setStatus("You left the room.");
    state.isHost = false;
    state.hostId = null;
}

function copyInviteLink() {
    // Always use host's ID for the invite link
    const roomId = state.hostId || state.myId || UI.workspace.roomId.textContent;
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString()).then(() => {
        const originalText = UI.workspace.btnCopy.textContent;
        UI.workspace.btnCopy.textContent = "✅";
        setTimeout(() => UI.workspace.btnCopy.textContent = originalText, 2000);
    });
}

function handlePeerErrors() {
    state.peer.on('error', (err) => {
        console.error(err);
        if (err.type === 'peer-unavailable') {
            setStatus("Connection failed: Room not found or host disconnected.");
            addSystemMessage("Connection failed. Host might be disconnected or room ID is invalid.");
        } else if (err.type === 'network') {
            setStatus("Network error. Check your internet connection.");
            addSystemMessage("Network error. Check your internet connection.");
        } else if (err.type === 'server-error') {
            setStatus("Signaling server error. Try again in a moment.");
            addSystemMessage("Signaling server error. Try again in a moment.");
        } else {
            setStatus("Error: " + err.message);
            addSystemMessage("Error: " + err.message);
        }
    });

    state.peer.on('disconnected', () => {
        addSystemMessage('Disconnected from signaling server. Attempting reconnect...');
        try {
            state.peer.reconnect();
        } catch (e) {
            addSystemMessage('Reconnection failed. Please reload the page.');
        }
    });
}

// Start app
init();
