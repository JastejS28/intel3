# Healthcare Kiosk - Patient Priority Queue System

An Intel-powered healthcare kiosk application that assigns patient priority based on vital signs. The system uses machine learning algorithms to prioritize patients in a queue based on their vital signs and medical urgency.

## Features

- **Quick Registration**: Fast and easy patient registration with minimal information required
- **Vital Signs Monitoring**: Accurately measure and record vital signs for priority assessment
- **Intelligent Queue Management**: AI-powered queue management based on health risk priority
- **Priority Assignment API Integration**: Uses an external API to determine patient priority scores

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **API Integration**: External priority assignment API (https://queue-assigner.onrender.com/docs)

## Project Structure

```
healthcare-kiosk/
├── client/             # React frontend
│   ├── public/         # Public assets
│   └── src/            # React source code
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       └── assets/     # Images and assets
└── server/             # Node.js backend
    ├── models/         # MongoDB schemas
    └── routes/         # API routes
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install-all
```

### Configuration

1. Create a `.env` file in the server directory with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare-kiosk
```

2. Create a `.env` file in the client directory with the following content:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

```bash
npm start
```

This will start both the server and client applications concurrently.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. Start the application
2. Navigate to the home page
3. Click "Start Patient Check-in"
4. Enter patient information
5. Enter or measure vital signs
6. Submit and view queue status

## Priority Assignment

The system integrates with an external API (https://queue-assigner.onrender.com/docs) to assign priority scores to patients based on their vital signs. If the API is unavailable, a local algorithm will calculate the priority score.

## License

MIT
