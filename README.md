# UK Side-Hustle Vault 💷

Track every passive-income stream in the UK from one dashboard – zero spreadsheets.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **📊 Dashboard Overview**: See all your passive income at a glance
- **💰 Automatic Income Tracking**: Auto-fetch dividends, interest, rental income via Open Banking
- **🏦 TrueLayer Integration**: Full UK Open Banking integration (sandbox + production ready)
- **📈 Tax Calculations**: Estimate tax on dividends (£2k allowance) and interest (PSA)
- **🏦 ISA Recommendations**: Smart prompts to use your £20k ISA allowance
- **🔄 Auto-Sync**: Transactions sync every 6 hours via Vercel Cron
- **🔒 Secure Authentication**: Clerk authentication with UK phone + Google support
- **📱 Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **⚡ Real-time Updates**: Live data with Next.js App Router
- **🎨 Beautiful UI**: Built with TailwindCSS and shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TailwindCSS 4** for styling
- **shadcn/ui** component library
- **TypeScript** for type safety
- **Lucide React** for icons

### Backend
- **Next.js API Routes**
- **Drizzle ORM** for database operations
- **SQLite** (development) → **PostgreSQL** (production)

### Authentication
- **Clerk** - UK phone + Google authentication

### Integrations
- **TrueLayer** - Full Open Banking API integration
- **Vercel Cron** - Scheduled transaction syncing (every 6 hours)
- **Nutmeg** - ISA affiliate integration

### Deployment
- **Vercel** (recommended)
- **Railway** or **Supabase** for PostgreSQL in production

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/BenjaKemp/GrindCore.git
   cd GrindCore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   - **Clerk**: Get keys from [clerk.com](https://clerk.com) → Create Application
   - **TrueLayer Sandbox**: Get credentials from [console.truelayer.com](https://console.truelayer.com)
     - Create a sandbox app
     - Set redirect URI: `http://localhost:3000/api/truelayer/callback`
     - Copy Client ID and Client Secret
   - **CRON_SECRET**: Generate with `openssl rand -base64 32`

4. **Set up the database**
   ```bash
   npx drizzle-kit push
   ```
   
   *Note: In development, this uses SQLite. For production, set `DATABASE_URL` to PostgreSQL.*

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Use the app**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign in with Clerk (create an account if needed)
   - Click "Connect Bank Account" on the dashboard
   - Use TrueLayer sandbox test credentials
   - Watch your passive income transactions appear!

## 🏦 TrueLayer Sandbox Setup

1. Visit [console.truelayer.com](https://console.truelayer.com) and create an account
2. Create a new **Sandbox** application
3. Configure:
   - **Redirect URIs**: `http://localhost:3000/api/truelayer/callback`
   - **Permissions**: `accounts`, `balance`, `transactions`
4. Copy your credentials to `.env.local`
5. Use test bank credentials when connecting (provided by TrueLayer)

## 🔄 Vercel Cron Setup (Production)

Add to your `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/sync-transactions",
    "schedule": "0 */6 * * *"
  }]
}
```

This syncs transactions every 6 hours. Add your `CRON_SECRET` to Vercel environment variables.

## 📁 Project Structure

```
GrindCore/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── streams/              # Income streams CRUD
│   │   ├── cron/                 # Scheduled jobs
│   │   └── truelayer/            # Open Banking integration
│   ├── dashboard/                # Dashboard pages
│   │   ├── page.tsx              # Main dashboard
│   │   └── streams/              # Income stream management
│   ├── sign-in/                  # Clerk sign-in
│   ├── sign-up/                  # Clerk sign-up
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
├── db/                           # Database
│   ├── schema.ts                 # Drizzle schema
│   └── index.ts                  # Database client
├── lib/                          # Utilities
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
├── drizzle.config.ts             # Drizzle configuration
├── middleware.ts                 # Clerk middleware
├── vercel.json                   # Vercel configuration
└── package.json                  # Dependencies
```

## 🗄️ Database Schema

### Users
- Synced with Clerk authentication
- Stores `clerkId`, email, timestamps

### Connections
- OAuth tokens from TrueLayer
- Access token, refresh token, expiry
- Supports token auto-refresh

### Bank Accounts
- Connected via TrueLayer
- Account details, balance, sort code
- Last sync timestamps

### Transactions
- Auto-fetched from TrueLayer
- Auto-categorized: dividend, interest, rental, other
- Amount, description, date
- Linked to bank accounts

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Configure Database**
   - Add PostgreSQL database (Railway, Supabase, or Vercel Postgres)
   - Update `DATABASE_URL` environment variable
   - Update Drizzle config for PostgreSQL

### Environment Variables for Production

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# TrueLayer
TRUELAYER_CLIENT_ID=your_client_id
TRUELAYER_CLIENT_SECRET=your_client_secret
TRUELAYER_REDIRECT_URI=https://yourdomain.com/api/truelayer/callback

# PostgreSQL (Production)
DATABASE_URL=postgresql://user:password@host:port/database

# Cron Job Security
CRON_SECRET=your_random_secret
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 🔐 Security

- All API routes are protected with Clerk authentication
- Cron jobs require bearer token authorization
- Environment variables for sensitive data
- SQL injection protection via Drizzle ORM
- XSS protection via React

## 🎯 Roadmap

- [x] Complete TrueLayer Open Banking integration
- [x] Automatic transaction categorization
- [x] UK Tax calculation (dividends + interest)
- [x] ISA allowance tracking & affiliate CTA
- [x] Vercel Cron auto-sync (6 hours)
- [ ] Add data visualization charts
- [ ] Export reports to PDF/CSV
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Advanced tax optimization suggestions
- [ ] Goal tracking features
- [ ] Stripe Pro tier (advanced features)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Authentication by [Clerk](https://clerk.com/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)

## 📧 Support

For support, email support@grindcore.dev or open an issue on GitHub.

---

Made with ❤️ for UK side-hustlers
