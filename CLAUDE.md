# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm dev` - Start development server on Next.js
- `npm run build` - Build for production
- `npm run build:cloudflare` - Build specifically for Cloudflare Pages deployment  
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm start` - Start production server
- `npm run preview` - Preview locally using Wrangler (Cloudflare Pages)
- `npm run deploy` - Deploy to Cloudflare Pages

## Architecture Overview

This is a **Chinese character learning application** for elementary school students, built with Next.js 15 and deployed on Cloudflare Pages. The app uses Firebase for authentication and data storage.

### Key Technologies
- **Next.js 15** with App Router and TypeScript
- **Firebase** (Auth + Firestore) for backend services
- **Tailwind CSS** for styling
- **Hanzi Writer** for Chinese character stroke animations
- **Pinyin Pro** for pronunciation processing
- **Cloudflare Pages** for deployment with edge computing

### Project Structure
- `src/app/` - Next.js App Router pages with nested routing
- `src/components/` - Reusable React components organized by feature
- `src/lib/firebase.js` - Firebase configuration and initialization
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions and services
- `scripts/` - Build and deployment scripts for Cloudflare

### Authentication System
The app uses Firebase Auth with role-based access control:
- Regular users can practice characters
- Admin users have access to `/admin/*` routes for character management
- AuthContext provides `user`, `isAdmin`, `login`, `register`, `logout`, `loginWithLine` globally
- Middleware protects authenticated routes
- **LINE Login Integration**: Implemented with simplified client-side approach using virtual emails
  - Desktop: Popup window login
  - Mobile: Redirect login flow
  - Automatic device detection
  - Callback URL: `/auth/line/callback-simple`

### Character Learning Features
- Interactive character writing practice with stroke animations
- Character search with pinyin pronunciation
- Practice sheets that can be exported as PDF
- Progress tracking and admin character management

### Deployment Configuration
- Optimized for Cloudflare Pages with file size limitations (20MB chunks)
- Uses `wrangler.toml` for deployment settings
- Special webpack configuration for production builds
- Post-build cleanup scripts to manage bundle sizes

### Environment Variables
Firebase configuration requires these environment variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` 
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

LINE Login configuration requires these environment variables:
- `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=2007735687`
- `LINE_LOGIN_CHANNEL_SECRET=e8eaacdb2e2d14d23d74037bf5ec3d84`
- `NEXT_PUBLIC_APP_URL=https://hanziplay.com`

### Development Notes
- Firebase is only initialized on the client side to avoid SSR issues
- The app includes extensive SEO optimization and structured data
- Chinese language support with Traditional Chinese (zh-TW) as primary locale
- Components use a mix of JSX and TSX files - follow existing patterns

### Key Dependencies and Libraries
- **Hanzi Writer** (`hanzi-writer@^3.7.2`) - Powers interactive character stroke animations
- **Pinyin Pro** (`pinyin-pro@^3.26.0`) - Handles pronunciation processing and tone conversion
- **html2canvas** + **jsPDF** - Used for practice sheet PDF generation
- **Framer Motion** - Provides smooth animations throughout the app
- **React Hook Form** - Form handling and validation

### Important Implementation Details
- **Theme System**: Multi-publisher support (康軒, 南一, 翰林) with grade-level organization (1st-6th)
- **PDF Generation**: Practice sheets use html2canvas to capture DOM elements before PDF conversion
- **Character Data**: Stroke order data comes from `hanzi-writer-data` package
- **Role-based Access**: Admin status determined by Firestore user documents with `role: 'admin'`
- **Cloudflare Optimization**: Webpack configured for 20MB chunk limits, post-build cleanup removes cache files >25MB

### File Structure Notes
- `src/components/auth/AuthContext.jsx` - Global authentication state management (includes LINE login)
- `src/lib/firebase.js` - Firebase initialization (client-side only)
- `src/middleware.js` - Route protection for authenticated areas
- `postbuild-cleanup.js` - Deployment optimization script
- `next.config.ts` - Contains Cloudflare-specific webpack optimizations
- `src/utils/lineAuthSimple.js` - LINE Login core logic (simplified implementation)
- `src/app/api/auth/line/token-simple/route.js` - LINE token exchange API
- `src/app/auth/line/callback-simple/page.js` - LINE login callback handler
- `docs/LINE_LOGIN_SETUP.md` - Complete LINE login setup documentation

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.