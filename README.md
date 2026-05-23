# Closer — Couple's Distance & Meeting Tracker (Static Version)

Closer is a private, real-time web application for couples to track their distance and countdown to their next meeting. This version is **fully static** and uses **Peer-to-Peer (WebRTC)** for synchronization, meaning no server is required.

## Features

- **Live Distance**: Real-time distance tracking using the Haversine formula.
- **Meeting Countdown**: Shared countdown timer for your next rendezvous.
- **Travel Estimates**: Estimates for walking, car, and train travel.
- **Peer-to-Peer**: Direct browser-to-browser connection using PeerJS (WebRTC).
- **Private**: No data is ever stored on a server. Your locations are shared only with your partner.
- **PWA Ready**: Installable on mobile for a native-like experience.
- **Static Hosting**: Deployable to GitHub Pages, Netlify, or Vercel.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand, PeerJS.
- **Icons**: Lucide React.
- **Hosting**: GitHub Pages compatible.

## Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open the URL and click "Create New Room". Share the generated code with your partner.

## Deployment

To deploy to GitHub Pages:

1. **Update `vite.config.ts`**: Ensure `base` matches your repository name.
2. **Deploy**:
   ```bash
   npm run deploy
   ```

## Implementation Details

- **P2P Sync**: When one person creates a room, they act as the WebRTC host. The partner connects using the room code (Host Peer ID).
- **Distance**: Calculated using the Haversine formula (Earth radius: 6371km).
- **Accuracy**: Geolocation uses `enableHighAccuracy` for better results on mobile.

## License
MIT
