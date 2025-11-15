# Nexus Trade

A modern, full-stack stock trading web application built with Next.js, featuring real-time market data, AI-powered insights, automated workflows, and personalized alerts.

## Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Sonner** - Toast notifications
- **Next Themes** - Dark mode support

### Backend & Infrastructure
- **Better Auth 1.3.34** - Authentication system
- **MongoDB 6.20.0** & **Mongoose 8.19.2** - Database
- **Inngest 3.44.3** - Event-driven workflows and background jobs
- **Nodemailer 7.0.10** - Email delivery
- **Finnhub API** - Real-time stock market data
- **Google Gemini AI** - AI-powered insights and summaries
- **bcryptjs** - Password hashing

### Development Tools
- **Turbopack** - Fast bundler
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Cursor** - IDE
- **Grok** - Research

##  Features

### 📊 Stock Dashboard
Track real-time stock prices with interactive line and candlestick charts, including historical data. Filter stocks by industry, performance, or market cap to find the best investment opportunities.

### 🔍 Powerful Search
Quickly find the best stocks with an intelligent search system that helps you navigate through thousands of companies efficiently.

### 📈 Watchlist & Alerts
Create a personalized watchlist, set alert thresholds for price changes or volume spikes, and receive instant email notifications to stay on top of the market.

### 💼 Company Insights
Explore detailed financial data such as PE ratio, EPS, revenue, recent news, filings, analyst ratings, and sentiment scores for informed decision-making.

### ⚡ Real-Time Workflows
Powered by Inngest, automate event-driven processes like price updates, alert scheduling, automated reporting, and AI-driven insights.

### 🤖 AI-Powered Alerts & Summaries
Generate personalized market summaries, daily digests, and earnings report notifications, helping users track performance and make data-driven decisions.

### 🔔 Customizable Notifications
Fine-tune alerts and notifications based on user watchlists and preferences for a highly personalized experience.

### 📊 Analytics & Insights
Gain insights into user behavior, stock trends, and engagement metrics, enabling smarter business and trading decisions.

## Recent Updates

### Password Visibility Toggle (Latest)
Enhanced user experience across authentication pages with secure, accessible password visibility toggles:

- **Sign-In Page** (`app/(auth)/sign-in/page.tsx`): Added password visibility toggle using Lucide React icons (`Eye`/`EyeOff`)
- **Sign-Up Page** (`app/(auth)/sign-up/page.tsx`): Implemented password visibility toggle with consistent styling
- **Reset Password Page**: Already featured password toggles, used as reference for implementation

**Implementation Details:**
- Uses `useState` for `showPassword` state management
- Accessible button with proper `aria-label` attributes
- Mobile-responsive design
- Preserves input values during toggle
- Consistent styling across all auth pages

### Email Template Customization
Updated welcome email templates to reflect Nexus Trade branding:

- **Welcome Email Template** (`lib/nodemailer/templates.ts`):
  - Modified "Go to Dashboard" button to use dynamic `NEXT_PUBLIC_APP_URL`
  - Updated unsubscribe and "Visit Nexus Trade" links with proper URL construction

- **Email Service** (`lib/nodemailer/index.ts`):
  - Enhanced `sendWelcomeEmail` function to dynamically construct URLs from environment variables
  - Supports customizable logo and dashboard preview images via `NEXT_PUBLIC_WELCOME_EMAIL_LOGO_URL` and `NEXT_PUBLIC_WELCOME_EMAIL_PREVIEW_URL`
  - Automatically builds dashboard, unsubscribe, and site URLs from `NEXT_PUBLIC_APP_URL`
  - Updated email subject and sender name to "Nexus Trade"

##  Quickstart

### Prerequisites
- Node.js 20+ installed
- MongoDB database (local or cloud)
- Finnhub API key ([Get one here](https://finnhub.io/))
- Google Gemini API key ([Get one here](https://ai.google.dev/))
- Gmail account for Nodemailer (or configure another SMTP service)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Nexus-Trade
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   NODE_ENV='development'

   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # FINNHUB
   NEXT_PUBLIC_NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key_here
   FINNHUB_BASE_URL=https://finnhub.io/api/v1

   # MONGODB
   MONGODB_URI=your_mongodb_connection_string_here

   # BETTER AUTH
   BETTER_AUTH_SECRET=your_random_secret_key_here
   BETTER_AUTH_URL=http://localhost:3000

   # GEMINI
   GEMINI_API_KEY=your_gemini_api_key_here

   # NODEMAILER
   NODEMAILER_EMAIL=your_gmail_address@gmail.com
   NODEMAILER_PASSWORD=your_app_specific_password_here

   # Optional: Email customization
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_WELCOME_EMAIL_LOGO_URL=http://localhost:3000/images/nexus-trade-logo.png
   NEXT_PUBLIC_WELCOME_EMAIL_PREVIEW_URL=http://localhost:3000/images/nexus-trade-dashboard.png
   ```

   **Important Notes:**
   - For Gmail, you'll need to generate an [App-Specific Password](https://support.google.com/accounts/answer/185833) for `NODEMAILER_PASSWORD`
   - Generate a secure random string for `BETTER_AUTH_SECRET` (e.g., using `openssl rand -base64 32`)
   - Replace all placeholder values with your actual credentials

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
npm start
```

##  Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the application | `http://localhost:3000` |
| `NEXT_PUBLIC_NEXT_PUBLIC_FINNHUB_API_KEY` | Finnhub API key for stock data | `your_finnhub_key` |
| `FINNHUB_BASE_URL` | Finnhub API base URL | `https://finnhub.io/api/v1` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/nexustrade` |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth | Random 32+ character string |
| `BETTER_AUTH_URL` | Better Auth callback URL | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API key | `your_gemini_key` |
| `NODEMAILER_EMAIL` | Email address for sending emails | `your_email@gmail.com` |
| `NODEMAILER_PASSWORD` | Email password or app-specific password | `your_password` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL for email links | `https://your-nexus-trade-domain.com` |
| `NEXT_PUBLIC_WELCOME_EMAIL_LOGO_URL` | Logo URL for welcome emails | `${NEXT_PUBLIC_APP_URL}/images/nexus-trade-logo.png` |
| `NEXT_PUBLIC_WELCOME_EMAIL_PREVIEW_URL` | Dashboard preview image URL | `${NEXT_PUBLIC_APP_URL}/images/nexus-trade-dashboard.png` |

## 📁 Project Structure

```
Nexus-Trade/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── sign-in/       # Sign-in page with password toggle
│   │   └── sign-up/       # Sign-up page with password toggle
│   ├── (root)/            # Main application routes
│   │   ├── stocks/        # Stock detail pages
│   │   └── page.tsx       # Dashboard
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── inngest/      # Inngest webhook handler
│   ├── forgot-password/  # Password recovery
│   └── reset-password/   # Password reset with toggle
├── components/            # React components
│   ├── forms/            # Form components
│   └── ui/               # UI primitives
├── lib/                   # Utility libraries
│   ├── actions/          # Server actions
│   ├── better-auth/      # Auth configuration
│   ├── inngest/          # Inngest functions
│   ├── nodemailer/       # Email templates and service
│   └── utils/           # Helper functions
└── public/               # Static assets
```

## Authentication

The application uses Better Auth for secure authentication with:
- Email/password authentication
- Password reset functionality
- Secure password hashing with bcryptjs
- Session management

## Email System

The email system is powered by Nodemailer and Inngest:
- **Welcome Emails**: Sent automatically on user signup with personalized AI-generated content
- **News Summary Emails**: Daily market news digests based on user watchlists
- **Price Alerts**: Real-time notifications when stocks hit target prices
- **Volume Alerts**: Notifications for unusual trading volume

All emails use responsive HTML templates with dark mode support.

##  AI Integration

Google Gemini AI powers:
- Personalized welcome email introductions
- Daily market news summaries
- Stock analysis and insights

##  Background Jobs

Inngest handles:
- Automated email delivery
- Scheduled news summaries (daily at 12:00 PM)
- Price and volume alert processing
- User activity tracking

##  Testing

Test database connection:
```bash
npm run test:db
```

## License

This project is proprietary.

For questions or issues, please contact the development team +254712017805.

Much thanks to Adrian of JS Mastery for providing tools and the tutorial from which this was built on.

---

**Built for traders and investors**
