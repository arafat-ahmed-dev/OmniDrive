# OmniDrive - Modern File Management System

[![Next.js](https://img.shields.io/badge/Next.js-13.0+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Appwrite](https://img.shields.io/badge/Appwrite-1.0+-F02E65?logo=appwrite)](https://appwrite.io/)

OmniDrive is a modern, cloud-based file management system built with Next.js, TypeScript, and Tailwind CSS, powered by Appwrite backend services.

## Features

- **Secure User Authentication**: Robust authentication system with email/password and OTP verification
- **File Management**: Upload, organize, and manage files with ease
- **Responsive Dashboard**: Beautiful and intuitive user interface
- **Comprehensive UI Library**: Reusable components built with Radix UI and Shadcn
- **Type-Safe Development**: Full TypeScript support for better code quality
- **Modern Styling**: Tailwind CSS for rapid UI development
- **File Preview**: Support for various file types including images, videos, and documents
- **Search & Filter**: Quickly find files with advanced search and filtering options

## Installation

1. **Prerequisites**
   - Node.js (v18 or higher)
   - npm (v9 or higher)
   - Appwrite project setup

2. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/omnidrive.git
   cd omnidrive
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Environment Variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
omnidrive/
├── public/              # Static assets
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # UI components
│   ├── constants/        # Application constants
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Appwrite integration and utilities
│   ├── types/            # TypeScript type definitions
├── .eslintrc.js         # ESLint configuration
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
```

## Usage

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Contributing

We welcome contributions! Please follow these guidelines:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeatureName`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeatureName`)
5. Open a pull request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
