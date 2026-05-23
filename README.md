# Closer — Couple's Distance & Meeting Tracker

Closer is a private, real-time web application for couples to track their distance and countdown to their next meeting. No accounts, no email, no tracking — just a simple 6-character room code to stay connected.

## Features

- **Live Distance**: Real-time distance tracking using the Haversine formula.
- **Meeting Countdown**: Shared countdown timer for your next rendezvous.
- **Travel Estimates**: Estimates for walking, car, and train travel.
- **Shared Session**: Sync coordinates and timers via WebSockets (Socket.io).
- **Private**: All data lives in-memory on the server and expires after 24 hours of inactivity.
- **PWA Ready**: Installable on mobile for a native-like experience.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand, Lucide React.
- **Backend**: Node.js, Express, Socket.io.
- **Deployment**: Docker, Docker Compose.

## Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start the development servers**:
   ```bash
   npm run dev
   ```
   - Client: `http://localhost:5173`
   - Server: `http://localhost:3001`

### Using Docker

1. **Build and run**:
   ```bash
   docker-compose up --build
   ```
   The app will be available at `http://localhost:3001`.

## Implementation Details

- **Distance**: Calculated using the Haversine formula (Earth radius: 6371km).
- **Rooms**: 6-character alphanumeric codes generated on the fly.
- **TTL**: Rooms and their data are automatically purged after 24 hours of inactivity.
- **Accuracy**: Geolocation uses `enableHighAccuracy` for better results on mobile.

## License
MIT
