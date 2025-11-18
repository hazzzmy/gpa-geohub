# GeoHUB

A modern precision agriculture platform built with Next.js, featuring Lark OAuth integration and geospatial data management capabilities. Driving Precision Agriculture with Data driven Decision Making.

## Features

- **Lark OAuth Integration** - Secure authentication via Lark SSO
- **Geospatial Data Management** - Upload, manage, and visualize spatial data
- **Modern UI/UX** - Built with Tailwind CSS and Radix UI components
- **Database Management** - PostgreSQL with Prisma ORM
- **Type Safety** - Full TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Lark Developer Account (for OAuth)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd global-papua-abadi-field-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:setup
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Required environment variables (see `env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `LARK_CLIENT_ID` - Lark OAuth app ID
- `LARK_CLIENT_SECRET` - Lark OAuth app secret
- `LARK_REDIRECT_URI` - OAuth callback URL

## Database Setup

The application uses PostgreSQL with Prisma ORM. Run the following commands to set up the database:

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with initial data
npm run db:seed
```

## Authentication

The application uses Lark OAuth for authentication. Users are automatically created on first login via Lark SSO.

## Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL + Prisma
- **Authentication**: Lark OAuth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Type Safety**: TypeScript

## Project Structure

```
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
├── modules/                # Feature modules
├── prisma/                 # Database schema
└── public/                 # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

© 2025 GeoHUB. All rights reserved.