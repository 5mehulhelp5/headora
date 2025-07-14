# Next.js Venia Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).. It is a modern, Progressive Web Application (PWA) storefront built on top of Magento 2 using Next.js and PWA Studio tools.

## About the Project

## Next.js Magento Venia Theme Overview

The [Next.js Magento Venia Theme](https://wiki.ocodecommerce.com/en/Theme/overview) is a headless eCommerce solution that integrates Magento's GraphQL API with a Next.js frontend. This setup allows for fast, scalable, and SEO-friendly eCommerce stores with enhanced flexibility in UI/UX customization.

![Logo](https://dev2.diamondtrov.com/media/home.webp)

### **Next.js Magento Venia Theme Pages**  

- [**Home Page**](https://wiki.ocodecommerce.com/en/Theme/home-page) 
  - Displays featured products, categories, and promotional banners.  
  - Optimized for performance with fast-loading content.  
  - Engaging UI with dynamic product recommendations.  

- [**Category Page**](https://wiki.ocodecommerce.com/en/Theme/category-page)  
  - Lists all products within a specific category.  
  - Includes filtering and sorting options for better navigation.  
  - Supports pagination and quick product previews.  

- [**Sub-Category Page**](https://wiki.ocodecommerce.com/en/Theme/sub-category)  
  - Showcases products within a more refined category structure.  
  - Helps users navigate deeper into specific product groups.  
  - Maintains a clean and responsive layout for seamless browsing.  

Would you like me to refine or expand on any section? 🚀
## Key Features

* **Progressive Web App (PWA):** Offline support, fast loading, and app-like experience
* **Dynamic Routing:** Supports multi-level categories and product pages
* **SEO Optimization:** Built-in support for meta tags, OpenGraph, and structured data (JSON-LD)
* **Filtering and Sorting:** Advanced product filtering and sorting capabilities
* **Responsive Design:** Optimized for mobile, tablet, and desktop devices
* **Magento Integration:** Seamlessly integrates with Magento 2 via GraphQL API

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* Yarn (recommended for monorepo support)
* Magento 2 instance with GraphQL API enabled

# Installation and Setup Guide

## [Installation](https://wiki.ocodecommerce.com/en/Theme/installation)

### Step 1: Clone the Repository

To get started, clone the Next.js GitHub repository using one of the following methods:

#### HTTPS
```bash
git clone https://github.com/browsewire/eco-theme-next.git
```

#### SSH
```bash
git clone git@github.com:browsewire/eco-theme-next.git
```

#### GitHub CLI
```bash
gh repo clone browsewire/eco-theme-next
```

Choose the method that best suits your workflow.

---

### Step 2: Update `next.config.ts`

After cloning the repository, update the `next.config.ts` file to configure environment variables and image domains. Replace the placeholders with your actual Magento endpoint, base URL, and logo URL.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    magentoEndpoint: 'https://<your-domains>/graphql',
    baseURL: 'https://<your-domains>/',
    baseURLWithoutTrailingSlash: 'https://<your-domains>',
    siteLogoURL: '/Logo/EcommerceLogo.png'
  },
  staticPageGenerationTimeout: 300000,
  trailingSlash: true,
  images: {
    domains: ['<your-domains>'], // Add your domain here
  },
};

export default nextConfig;
```

---

### Step 3: Install Dependencies

Run the following commands to install the necessary packages and start the development server:

```bash
npm install
npm run dev
```

This will install all dependencies and start the project on your local development server.
## Project Structure

```
next-venia/
├── components/          # Reusable UI components
├── graphql/            # GraphQL queries and client setup
├── pages/              # Next.js pages and API routes
├── public/             # Static assets (images, fonts, etc.)
├── styles/             # Global and module-specific styles
├── utils/              # Utility functions and helpers
├── .env                # Environment variables
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```

## Useful Links

### PWA Studio Documentation
* PWA Studio Overview
* PWA Studio Beginner Guide
* Tools and Libraries
* PWA Studio Best Practices

### Venia Storefront
* Venia Documentation
* Venia UI Components

### Magento Integration
* Magento GraphQL API
* Magento PWA Studio

## Contributing

We welcome contributions from the community! If you're interested in contributing to this project, please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Submit a pull request with a detailed description of your changes

For more information, check out our Contribution Guide.

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy your project:
```bash
vercel
```

3. Follow the prompts to complete the deployment.

For more details, refer to the Next.js Deployment Documentation.

## Join the Conversation

If you have any questions, concerns, or ideas, join our community Slack channel:
* #pwa

You can also add our public calendar to stay updated with events and announcements.

## Acknowledgments

This project is inspired by:
* **Magento PWA Studio**: A collection of tools for building PWAs on Magento
* **Venia**: A reference storefront built with PWA Studio
* **Alpaca Theme**: A discontinued Magento 2 theme that influenced this project's design and structure

## License

This project is licensed under the MIT License.