const CLIENT_ID = '4b933a2056b8493b97414f14fc802800'; // Get this from Spotify Developer Dashboard
const REDIRECT_URI = 'https://codyborn.github.io/projects/sublime/'; // Update this to your actual domain
const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'playlist-read-private',
    'playlist-read-collaborative'
].join(' ');

let accessToken = null;
let player = null;

// Initialize Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    const connectButton = document.getElementById('spotify-connect');
    connectButton.addEventListener('click', connectToSpotify);
};

function connectToSpotify() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
}

// Handle the redirect with token
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    accessToken = params.get('access_token');

    if (accessToken) {
        initializePlayer();
        loadPlaylists();
        document.getElementById('spotify-container').style.display = 'block';
    }
});

async function initializePlayer() {
    player = new Spotify.Player({
        name: 'Sublime Tunes',
        getOAuthToken: cb => { cb(accessToken); }
    });

    // Hide both buttons initially
    const playButton = document.getElementById('play-spotify');
    const pauseButton = document.getElementById('pause-spotify');
    playButton.style.display = 'none';
    pauseButton.style.display = 'none';

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        // Don't enable buttons here anymore - wait for playlist selection
    });

    // Add player state listener
    player.addListener('player_state_changed', state => {
        if (!state) {
            // No track playing
            playButton.style.display = 'none';
            pauseButton.style.display = 'none';
            return;
        }

        if (state.paused) {
            playButton.style.display = 'block';
            pauseButton.style.display = 'none';
        } else {
            playButton.style.display = 'none';
            pauseButton.style.display = 'block';
        }
    });

    player.connect();

    document.getElementById('play-spotify').addEventListener('click', () => player.resume());
    document.getElementById('pause-spotify').addEventListener('click', () => player.pause());
}

async function loadPlaylists() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        
        const playlistSelect = document.getElementById('playlist-select');
        data.items.forEach(playlist => {
            const option = document.createElement('option');
            option.value = playlist.uri;
            option.textContent = playlist.name;
            playlistSelect.appendChild(option);
        });

        let deviceId = null;
        player.addListener('ready', ({ device_id }) => {
            deviceId = device_id;
        });

        playlistSelect.addEventListener('change', async (e) => {
            const playButton = document.getElementById('play-spotify');
            const pauseButton = document.getElementById('pause-spotify');

            if (!e.target.value) {
                // No playlist selected
                playButton.style.display = 'none';
                pauseButton.style.display = 'none';
                return;
            }

            if (e.target.value && deviceId) {
                await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        context_uri: e.target.value
                    })
                });
            }
        });
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
} 