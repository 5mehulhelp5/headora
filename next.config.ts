import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  reactStrictMode: true,
  

  env: {
    magentoEndpoint: 'https://www.truefacetnft.com/graphql', // magento endpoint
    baseURL:'https://www.truefacetnft.com/', // baseURL of your site with  trailing slash 
    baseURLWithoutTrailingSlash:'https://www.truefacetnft.com', // baseURL of your site without trailing slash 
    SecondStoreURL: 'https://boutique.truefacetnft.com/',
    logoURL: '', // if you don't have Logo then leave it blank. 
    logoText: 'Truefacet', // if you don't have Logo then you can simply site name 
    siteName: 'Truefacet' // your site name
  },  

  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase request payload limit
    },
  },
  staticPageGenerationTimeout: 300000,
  output: 'export',
  trailingSlash: false, // Ensures static files have .html
  
  images: {
    unoptimized: true,
  }

};

export default nextConfig;