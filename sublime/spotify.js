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

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        document.getElementById('play-spotify').disabled = false;
        document.getElementById('pause-spotify').disabled = false;
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

        playlistSelect.addEventListener('change', async (e) => {
            if (e.target.value) {
                await fetch(`https://api.spotify.com/v1/me/player/play`, {
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