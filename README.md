# Krama - Healthcare Queue Management System

A modern healthcare queue management system that helps clinics manage patient flow efficiently and patients avoid long waiting times.

## 🚀 Features

- **Real-time Queue Management**: Track queue positions and estimated wait times
- **Patient & Clinic Portals**: Separate interfaces for patients and clinic staff
- **Appointment Booking**: Schedule appointments with preferred doctors and time slots
- **Token System**: Digital tokens with different categories (A, B, C)
- **Review System**: Patients can rate and review clinics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/tejasdn24/Krama.git
   cd Krama
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── landing/        # Landing page components
│   ├── layout/         # Layout components
│   ├── shared/         # Shared components
│   └── ui/             # shadcn/ui components
├── context/            # React context providers
├── data/               # Mock data and types
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── lib/                # Utility functions
├── pages/              # Page components
└── test/               # Test files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🏥 User Flows

### For Patients
1. **Login/Signup** - Create account or login
2. **Find Clinics** - Search and filter nearby clinics
3. **Book Appointment** - Schedule with preferred doctors
4. **Join Queue** - Get digital token for walk-in visits
5. **Track Queue** - Monitor queue position in real-time
6. **Write Reviews** - Rate clinic experience

### For Clinics
1. **Login/Register** - Clinic authentication
2. **Manage Queue** - Control patient flow with next/skip functions
3. **Manage Time** - Set clinic hours and doctor schedules
4. **View Dashboard** - Overview of daily operations
5. **Manage Profile** - Update clinic information

## 🔗 Backend Integration

The frontend is designed to work with the QueueSmart backend API:
- **Authentication**: JWT-based auth with refresh tokens
- **Real-time Updates**: Socket.IO for live queue updates
- **API Endpoints**: RESTful API for all operations

## 🎨 UI Components

Built with shadcn/ui components:
- Forms with validation
- Data tables and cards
- Modals and dialogs
- Navigation and menus
- Loading states and skeletons

## 📱 Responsive Design

- **Mobile-first** approach
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** interactions
- **Progressive enhancement**

## 🔒 Security Features

- **Input validation** with Zod schemas
- **XSS protection** through React
- **Secure authentication** flow
- **API error handling**

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Other Platforms
The built app can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues

---

**QueueSmart** - Making healthcare more efficient, one queue at a time. 🏥
