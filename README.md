# Documentation

## Overview

This is a React-based drawing application that allows users to draw on a canvas using different tools and settings. The app features a pencil tool, eraser, color selection, background customization, and image saving capabilities. It also supports responsive design for both desktop and mobile devices.

## Development Choices & Technology Stack

### Core Framework: Next.js

Next.js was selected as the foundation for this application due to its powerful features for React-based web development:

- **Server-Side Rendering (SSR)** and **Static Site Generation (SSG)** capabilities that improve performance and SEO
- **File-based routing** that simplifies navigation structure
- **API routes** that enable serverless function development within the same codebase
- **Built-in optimization** for images, fonts, and scripts
- **React 18 support** with enhanced features like Server Components and Streaming

### UI Framework: Tailwind CSS

Tailwind CSS was chosen for styling due to its utility-first approach:

- **Development speed** through pre-defined utility classes
- **Consistency** across the application with a design system based on constraints
- **Highly customizable** while maintaining a small bundle size through PurgeCSS
- **Responsive design** made simple with intuitive breakpoint classes
- **Dark mode** support built-in

### Component Library: shadcn/ui

shadcn/ui provides high-quality, accessible UI components:

- **Customizable and accessible** components that can be easily customized
- **Copy-paste implementation** that avoids dependency bloat
- **Tailwind integration** for consistent styling
- **Radix UI primitives** underneath for robust accessibility
- **TypeScript support** for enhanced developer experience

### UI Primitives: Radix UI

Radix UI serves as the foundation for our custom components:

- **Headless UI components** that are fully accessible
- **Composition pattern** allowing for maximum flexibility
- **Focus management** and keyboard navigation built-in
- **ARIA compliance** without additional developer effort

### Icons: Lucide Icons

Lucide Icons was selected for its:

- **Consistent design language** across all icons
- **SVG-based** implementation for crisp rendering at any size
- **Lightweight** with tree-shaking support
- **Customizable** properties like size, stroke width, and color

### Version Control & Deployment: GitHub & Vercel

- **GitHub** provides collaborative development features, code reviews, and CI/CD integration
- **Vercel** offers a seamless deployment experience specifically optimized for Next.js applications with:
  - Preview deployments for each PR
  - Automatic HTTPS
  - Edge caching
  - Analytics
  - Integration with GitHub workflows

## UI Elements

### Top Bar

- UI visibility toggle
- User avatar
- Action buttons (save, copy, clear)
- Camera capture (mobile only)
- Tool selection (pencil/eraser)
- Theme toggle and GitHub link

### Configuration Panel

- Displayed inline on desktop
- Available via drawer on mobile
- Color selectors with presets and custom picker
- Stroke width options

## Technical Features

### Responsive Design

- Adapts UI based on screen size
- Shows/hides elements based on context
- Uses a drawer for settings on mobile

### Color Management

- Supports hex color codes
- Includes preset colors for quick selection
- Uses the Colorful color picker component

## User Experience Considerations

- Shows/hides UI during active drawing
- Provides tooltips for all controls
- Supports theme switching
- Handles canvas state preservation during resize
- Provides feedback via toast notifications

## Installation & Deployment Guide

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/hichemfantar/freedraw.git
   cd freedraw
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

To test the production build locally:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

### Deployment with Vercel

#### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel:
   - Log in to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings (environment variables, build commands)
   - Click "Deploy"

Vercel will automatically deploy your application and provide a production URL.

#### Manual Deployment

If you prefer to deploy manually:

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   # or
   yarn global add vercel
   ```

2. Log in to Vercel:

   ```bash
   vercel login
   ```

3. Deploy the application:

   ```bash
   vercel
   ```

Follow the prompts to configure your deployment.

### CI/CD Pipeline

The repository is configured with GitHub Actions for continuous integration.

When code is merged to the main branch, Vercel automatically deploys to production.

### Updating the Application

To update the deployed application:

1. Push changes to your GitHub repository
2. Vercel will automatically build and deploy the updated version
