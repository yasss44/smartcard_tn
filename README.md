# Smart Card Tunisia

A web application for creating and managing customizable NFC business cards with a drag-and-drop editor.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-app-id/deploy-status)](https://app.netlify.com/sites/your-netlify-app-name/deploys)

## Features

- Drag-and-drop editor for designing link pages
- Custom background uploads and color/gradient tools
- Auto-generated unique URLs for each card
- E-commerce integration with cash-on-delivery payment
- Mobile-friendly landing pages when NFC cards are scanned
- Cyberpunk-inspired UI with dark mode

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, react-dnd for drag-and-drop
- **Backend**: Node.js with Express (traditional) or Netlify Functions (serverless)
- **Database**: PostgreSQL (Aiven Cloud)
- **Hosting**: Netlify (serverless) or traditional hosting

## Project Structure

```
smart-card-tunisia/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── context/        # React context
│       ├── hooks/          # Custom hooks
│       ├── services/       # API services
│       └── styles/         # CSS/Tailwind styles
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
└── netlify/                # Netlify serverless functions
    └── functions/          # API functions for Netlify
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (optional for frontend-only development)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd smart-card-tunisia
   ```

2. Install all dependencies:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DB_HOST=your-db-host
   DB_PORT=your-db-port
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   JWT_SECRET=your-jwt-secret
   ```

### Running the Application

#### Full Stack Development
```
npm run dev
```

#### Frontend Only Development
```
npm run client
```

#### Backend Only Development
```
npm run server
```

#### Netlify Development
```
npm run netlify:dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Cards
- `POST /api/cards` - Create a new card (protected)
- `GET /api/cards` - Get all cards for a user (protected)
- `GET /api/cards/:id` - Get a card by ID (protected)
- `GET /api/cards/url/:uniqueUrl` - Get a card by unique URL (public)
- `PUT /api/cards/:id` - Update a card (protected)
- `DELETE /api/cards/:id` - Delete a card (protected)

### Orders
- `POST /api/orders` - Create a new order (protected)
- `GET /api/orders` - Get all orders for a user (protected)
- `GET /api/orders/:id` - Get an order by ID (protected)

### Uploads
- `POST /api/upload` - Upload a file (protected)

## Deployment Options

### Netlify Deployment

This project is optimized for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `client/dist`
4. Deploy!

### Traditional Deployment

For traditional hosting:

1. Clone the repository
2. Install dependencies: `npm run install-all`
3. Build the client: `npm run build`
4. Start the server: `npm start`

## License

This project is licensed under the ISC License.

## Credits

Developed by Smart Card Tunisia
