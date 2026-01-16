const log = require('fancy-log');
const { Client } = require('discord-rpc');
const updatePresence = require('./core');
const config = require('./config');

const clientId = '1461687438417072159';
const uri = `http://127.0.0.1:${config.port}/variables.html`;

let rpc;
let isConnectedToDiscord = false;
let mpcCheckInterval = null;

if (isNaN(config.port)) {
    throw new Error('Port is empty or invalid in config.js');
}

log.info('INFO: Starting MPC-DiscordRPC...');

async function connectToDiscord() {
    if (rpc) {
        try {
            await rpc.destroy();
        } catch {}
    }

    rpc = new Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        log.info('INFO: Connected to Discord.');
        isConnectedToDiscord = true;
        startMpcLoop();
    });

    rpc.transport.once('close', () => {
        log.error('ERROR: Disconnected from Discord. Retrying in 10s...');
        isConnectedToDiscord = false;
        stopMpcLoop();
        setTimeout(connectToDiscord, 10000);
    });

    try {
        await rpc.login({ clientId });
    } catch (err) {
        log.warn('WARN: Could not connect to Discord. Retrying in 10s...');
        setTimeout(connectToDiscord, 10000);
    }
}

function startMpcLoop() {
    if (mpcCheckInterval) clearInterval(mpcCheckInterval);
    checkMpc(); 
    mpcCheckInterval = setInterval(checkMpc, 5000);
}

function stopMpcLoop() {
    if (mpcCheckInterval) {
        clearInterval(mpcCheckInterval);
        mpcCheckInterval = null;
    }
}

async function checkMpc() {
    if (!isConnectedToDiscord || !rpc) return;

    try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const html = await response.text();
        const serverHeader = response.headers.get('server') || 'MPC';
        
        updatePresence(html, serverHeader, rpc);
    } catch (err) {
        
    }
}

connectToDiscord();