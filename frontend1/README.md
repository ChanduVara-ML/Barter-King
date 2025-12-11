# Woqal Dish Dash

A comprehensive restaurant management platform built with modern web technologies, designed to streamline restaurant operations including menu management, order processing, customer analytics, and AI-powered voice ordering.

## 🚀 Features

### Core Functionality

- **Dashboard Analytics** - Real-time metrics for calls, orders, revenue, and customer satisfaction
- **Menu Management** - Comprehensive menu item and category management with image uploads
- **Order Management** - Order queue, tracking, and fulfillment system
- **Customer Data** - Customer analytics and relationship management
- **Voice AI Integration** - AI-powered voice ordering system
- **Restaurant Management** - Multi-restaurant support with switching capabilities
- **Staff Management** - Employee management and role-based access control
- **Payment Settings** - Integrated payment processing and billing management
- **Website Builder** - Custom restaurant website creation tools
- **Online Ordering** - Digital ordering platform integration

### Technical Features

- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-time Updates** - Live data synchronization across components
- **File Management** - Image upload and media management system
- **Authentication** - Secure user authentication and authorization
- **API Integration** - RESTful API services for all major functions
- **State Management** - Zustand for global state management
- **Data Fetching** - React Query for efficient server state management

## 🛠️ Technology Stack

This project is built with:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3.4 with shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom components
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner toast notifications
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript, PostCSS

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout and navigation components
│   ├── menu/           # Menu management components
│   ├── restaurant/     # Restaurant management components
│   ├── settings/       # Settings and configuration components
│   └── ui/             # Base UI components (shadcn/ui)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── pages/              # Application pages and routes
├── services/           # API service layer
├── stores/             # Zustand state stores
└── types/              # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd woqal-dish-dash-main
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with your configuration:

```env
VITE_API_BASE_URL=your_api_base_url
VITE_UPLOAD_API_URL=your_upload_api_url
```

### Tailwind CSS

The project uses Tailwind CSS with a custom configuration. The `tailwind.config.ts` file contains all the necessary configurations for the design system.

## 📱 Responsive Design

The application is built with a mobile-first approach and includes:

- Responsive grid layouts
- Mobile-optimized navigation
- Touch-friendly interactions
- Adaptive component sizing

## 🔐 Authentication

The platform includes a comprehensive authentication system:

- User registration and login
- Protected routes
- Role-based access control
- JWT token management

## 🏪 Multi-Restaurant Support

- Restaurant switching functionality
- Restaurant-specific data isolation
- Shared user accounts across restaurants
- Restaurant profile management

## 📊 Analytics & Reporting

- Real-time dashboard metrics
- Order analytics
- Customer insights
- Revenue tracking
- Performance indicators

## 🤖 AI Integration

- Voice AI ordering system
- AI-powered customer interactions
- Smart menu recommendations
- Automated order processing

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Options

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or connect your repository
- **AWS S3**: Upload the `dist` folder to an S3 bucket
- **Traditional hosting**: Upload the `dist` folder to your web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:

- Check the project documentation
- Review the code comments
- Contact the development team

---

**Built with ❤️ using modern web technologies**
