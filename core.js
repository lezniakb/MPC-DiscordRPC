const log = require('fancy-log');
const {
    ignoreBrackets,
    ignoreFiletype,
    replaceUnderscore,
    showRemainingTime,
    replaceDots,
} = require('./config');

const playback = {
    filename: '',
    position: '',
    duration: '',
    state: '',
    prevState: '',
    prevPosition: '',
    lastUpdate: 0
};

const states = {
    '-1': { string: 'Idling', stateKey: 'stop_small' },
    '0': { string: 'Stopped', stateKey: 'stop_small' },
    '1': { string: 'Paused', stateKey: 'pause_small' },
    '2': { string: 'Playing', stateKey: 'play_small' }
};

const regexCache = {
    filepath: /<p id="filepath">([^<]*)<\/p>/,
    state: /<p id="state">([^<]*)<\/p>/,
    duration: /<p id="durationstring">([^<]*)<\/p>/,
    position: /<p id="positionstring">([^<]*)<\/p>/
};

function extract(html, key) {
    const match = html.match(regexCache[key]);
    return match ? match[1] : '';
}

function trimStr(str, length) {
    return str.length > length ? str.substring(0, length - 3) + "..." : str;
}

function parseTime(timeStr) {
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
    }
    return seconds * 1000;
}

function sanitizeTime(time) {
    return time.startsWith('00:') ? time.substring(3) : time;
}

module.exports = (html, serverHeader, rpc) => {
    const mpcFork = serverHeader.replace(' WebServer', '');
    
    let rawFilename = extract(html, 'filepath');
    let filename = rawFilename.split(/[\\/]/).pop(); 
    
    const stateCode = extract(html, 'state');
    const durationRaw = extract(html, 'duration');
    const positionRaw = extract(html, 'position');

    playback.state = stateCode;
    playback.duration = sanitizeTime(durationRaw);
    playback.position = sanitizeTime(positionRaw);

    if (replaceUnderscore) {
        filename = filename.replace(/_/g, " ");
    }

    if (ignoreBrackets) {
        const cleanName = filename.replace(/ *\[[^\]]*\]/g, "");
        if (cleanName.includes('.')) { 
            filename = cleanName;
        }
    }

    if (replaceDots) {
        filename = filename.replace(/[.](?=.*[.])/g, " ");
    }

    if (ignoreFiletype) {
        const lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex !== -1) {
            filename = filename.substring(0, lastDotIndex);
        }
    }

    playback.filename = trimStr(filename, 128);

    if (!states[playback.state]) return;

    const payload = {
        details: playback.filename,
        largeImageKey: mpcFork === 'MPC-BE' ? 'mpcbe_logo' : 'default',
        largeImageText: mpcFork,
        smallImageKey: states[playback.state].stateKey,
        smallImageText: states[playback.state].string
    };

    if (playback.state === '-1') {
        payload.state = states[playback.state].string;
        payload.details = undefined;
    } else if (playback.state === '1') {
        payload.state = `${playback.position} / ${playback.duration}`;
    } else if (playback.state === '2') {
        payload.state = `${playback.duration} total`;
        const currentMs = parseTime(durationRaw);
        const positionMs = parseTime(positionRaw);
        
        if (showRemainingTime) {
            payload.endTimestamp = Date.now() + (currentMs - positionMs);
        } else {
            payload.startTimestamp = Date.now() - positionMs;
        }
    }

    const currentPositionMs = parseTime(positionRaw);
    const prevPositionMs = parseTime(playback.prevPosition);
    const timeDiff = Math.abs(currentPositionMs - prevPositionMs);

    const shouldUpdate = 
        playback.state !== playback.prevState ||
        playback.filename !== playback.lastFilename ||
        (playback.state === '2' && timeDiff > 6000); 

    if (shouldUpdate) {
        rpc.setActivity(payload).catch(err => log.error(err));
        
        log.info(`UPDATE: ${states[playback.state].string} - ${playback.position}/${playback.duration} - ${playback.filename}`);

        playback.prevState = playback.state;
        playback.prevPosition = positionRaw;
        playback.lastFilename = playback.filename;
    } else {
        playback.prevPosition = positionRaw;
    }
};