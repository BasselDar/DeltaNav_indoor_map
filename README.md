# Indoor Navigation System

An interactive indoor navigation system built with React and TypeScript, featuring pathfinding, room search, and an intuitive user interface.

## Features

- 🗺️ Interactive SVG-based floor maps
- 🔍 Real-time room search functionality
- 🛣️ Shortest path calculation using Dijkstra's algorithm
- 📱 Responsive design for mobile and desktop
- 🎯 Point-to-point navigation
- 🚻 Support for various room types (offices, labs, facilities)
- 🔄 Floor switching capability
- 🎨 Modern UI with smooth animations

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- SVG for map rendering

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd indoor_web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/         # React components
├── data/              # Map and graph data
│   └── indoor/        # Indoor map data
│       ├── ground/    # Ground floor data
│       └── 4th/       # 4th floor data
└── indoor/            # Core navigation logic
    ├── mapInteractions.ts    # Map interaction handlers
    ├── pathFinder.ts        # Pathfinding algorithm
    ├── roomData.ts         # Room information
    └── roomHelpers.ts      # Utility functions
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 