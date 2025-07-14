//const fs = require('fs');
import fs from 'fs/promises';  

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';

//const path = require('path');
const BASE_URL = process.env.baseURLWithoutTrailingSlash || 'https://www.truefacetnft.com'; 
import { createFiltersFromAggregations, createProductsFromMagProducts } from '../components/ConfigureProduct.js';

const staticSitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/give-away/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/affirm-guide/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

// Static content for sitemap.xml
const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/index-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/cat-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/prod-sitemap.xml</loc>
  </sitemap>
</sitemapindex>`;

// Function to write static index-sitemap.xml
function writeStaticSitemap() {
  const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const outputDir = path.resolve(__dirname, '../public');

    if (!fs.access(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFile(path.join(outputDir, 'index-sitemap.xml'), staticSitemapContent, 'utf8');
}

function writeSitemapIndex() {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const outputDir = path.resolve(__dirname, '../public');
  
    if (!fs.access(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemapIndexContent, 'utf8');
  }
// Async function to handle writing dynamic and static sitemaps
async function generateSitemaps() {

    //console.log('---------------generateSitemaps--------------')
    try {
        // Write dynamic sitemaps
        await categorySitemapToFile(); // Existing dynamic category sitemap function
         await productsSitemapToFile(); // Existing dynamic product sitemap function

        // Write static sitemap

        writeStaticSitemap();
        writeSitemapIndex()
        //console.log('Sitemaps generated successfully.');
    } catch (error) {
        console.error('Error generating sitemaps:', error);
    }
}

generateSitemaps();

function generateSiteMap(data) {
    const urls = data
        .map(({ url, priority }) => `
      <url>
        <loc>${`${url}`}</loc>
        <changefreq>weekly</changefreq>
        <priority>${priority}</priority>
      </url>
    `)
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;
}


async function fetchCategories() {
 const fetchSSGCategoriesQuery = `
query {
  categories{ 
  items{
    product_count
    url_path
    children{
     product_count
     url_path
     children{
      product_count
      url_path
       children{
        product_count
        url_path
}
  }

  }
  }
}
}
`;
    try {
        const response = await fetch(`${BASE_URL}/graphql/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: fetchSSGCategoriesQuery,
            }),
        });

        if (response.ok) {
          const data = await response.json();
            return data.data.categories.items[0];
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
            //console.log(error)
    }
}

async function fetchBTCategories() {
  const fetchSSGCategoriesQuery = `
 query {
   categories{ 
   items{
     product_count
     url_path
     children{
      product_count
      url_path
      children{
       product_count
       url_path
        children{
         product_count
         url_path
 }
   }
 
   }
   }
 }
 }
 `;
     try {
         const response = await fetch(`${BASE_URL}/graphql/`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                    'Store': 'boutique'
             },
             body: JSON.stringify({
                 query: fetchSSGCategoriesQuery,
             }),
         });
 
         if (response.ok) {
           const data = await response.json();
             return data.data.categories.items[0];
         } else {
             throw new Error('Failed to fetch data');
         }
     } catch (error) {
             //console.log(error)
     }
 }
 

async function categorySitemapToFile() {
  //console.log('//////////////////started with Category SitemapToFile//////////////')
   
    let categories = await fetchCategories();
    
    
    let urls = [];
    let topLevelCategoriesPath=[]
    let secondLevelCategoriesPath=[]
    let thirdLevelCategoriesPath=[]
    if (categories?.children) {
        categories.children.forEach((category) => {
            if (category.product_count > 0) {
              const cleanUrlPath = category.url_path+'.html'; 
              topLevelCategoriesPath.push(cleanUrlPath)
                urls.push({ priority: 0.8, url: `${BASE_URL}/${category.url_path}.html` })
            }
            if (category.children) {
                category.children.forEach((subCategory) => {
                    if (subCategory.product_count > 0) {
                      secondLevelCategoriesPath.push(subCategory.url_path+'.html')
                        urls.push({ priority: 0.8, url: `${BASE_URL}/${subCategory.url_path}.html` })
                    }
                    if (subCategory?.children) {
                        subCategory.children.forEach((subSubCategory) => {
                            if (subSubCategory.product_count > 0) {
                              thirdLevelCategoriesPath.push(subSubCategory.url_path+'.html')
                                urls.push({ priority: 0.8, url: `${BASE_URL}/${subSubCategory.url_path}.html` })
                            }
                        });
                    }
                });
            }
        });


    }

     
    
    

    const sitemap = generateSiteMap(urls);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const outputDir = path.resolve(__dirname, '../public');

    if (!fs.access(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    


    const topLevelCategoriesPathFile = path.resolve(`./cacheM/topLevelCategoriesPath.json`);
    fs.writeFile(topLevelCategoriesPathFile, JSON.stringify(topLevelCategoriesPath));

    const secondLevelCategoriesPathFile = path.resolve(`./cacheM/secondLevelCategoriesPath.json`);
    fs.writeFile(secondLevelCategoriesPathFile, JSON.stringify(secondLevelCategoriesPath));

    const thirdLevelCategoriesPathFile = path.resolve(`./cacheM/thirdLevelCategoriesPath.json`);
    fs.writeFile(thirdLevelCategoriesPathFile, JSON.stringify(thirdLevelCategoriesPath));

    fs.writeFile(path.join(outputDir, 'cat-sitemap.xml'), sitemap, 'utf8');

}



function generateProductSiteMap(data) {
    const urls = data
        .map(({ url, priority }) => `
        <url>
          <loc>${`${url}`}</loc>
          <changefreq>weekly</changefreq>
          <priority>${priority}</priority>
        </url>
      `)
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;
}

const fetchProductsQuery = (currentPage = 1) => `
query {
  products(filter: { }
  pageSize:1000
  currentPage:${currentPage},
 ) {
    page_info{
    page_size
      total_pages
      current_page
    }
    items{
      url_key
      sku
      updated_at
    }
    }
  }`;

async function fetchAllProducts(currentPage) {
     //console.log('fetchAllProducts',currentPage)
    try {
        const query = fetchProductsQuery(currentPage)
        const response = await fetch(`${BASE_URL}/graphql/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (response.ok) {
            const data = await response.json();
            return data?.data?.products || { items: [], page_info: {} };
        } else {
          return { items: [], page_info: {} };
        }
    } catch (error) {

    }
}



async function productsSitemapToFile() {
  //console.log('//////////////////started with productsSitemapToFile//////////////')
  
  let urls = [];
  let allProductsPath=[]

  let currentPage = 1;
  let totalPages=1
  while (currentPage <= totalPages) {
    const fetchPages = [...Array(5).keys()]
    .map(offset => currentPage + offset)
    .filter(page => page <= totalPages)
    .map(page => fetchAllProducts(page));

   const pageResults = await Promise.all(fetchPages);
   for (const pageData of pageResults) {
    if (pageData && pageData.items.length > 0) {
     await processProductsInBatches(pageData.items);
      totalPages = pageData.page_info?.total_pages || totalPages;
      pageData.items.forEach(product => {
        allProductsPath.push(product.url_key+'.html');
      });
      const products = pageData.items.map(product => ({
        priority: 0.7,
        url: `${BASE_URL}/${product.url_key}.html`,
    }));

    urls = [...urls, ...products];
    }
   }
   currentPage += fetchPages.length;
  }


  


  // Generate and save the sitemap
    const prositemap = generateProductSiteMap(urls);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const prooutputDir = path.resolve(__dirname, '../public');
  
  if (!fs.access(prooutputDir)) {
      fs.mkdirSync(prooutputDir, { recursive: true });
  }

  const allProductsPathFile = path.resolve(`./cacheM/allProductsPath.json`);
  fs.writeFile(allProductsPathFile, JSON.stringify(allProductsPath));
  fs.writeFile(path.join(prooutputDir, 'prod-sitemap.xml'), prositemap, 'utf8');
  
  //console.log('✅ Sitemap generated successfully!');

}


async function processProductsInBatches(items) {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Get timestamp for 24 hours ago

  for (let i = 0; i < items.length; i += 20) {
      const batch = items.slice(i, i + 20);
      //console.log(`Processing Batch: ${i + 1} - ${i + batch.length}`);

      await Promise.all(
          batch.map(async (item) => {
            const cacheUrlKeyFileName = createHash('md5')
              .update(item.url_key + '.html')
              .digest('hex')
              .slice(0, 12);
          

          const cacheUrlKeyFilePath = path.resolve(`./cacheM/product/${cacheUrlKeyFileName}.json`);


                 // ✅ Check: If cache exists AND product is NOT updated in the last 24 hours, skip it
                try {
                    await fs.access(cacheUrlKeyFilePath); // Check if file exists
                    const updatedAt = new Date(item.updated_at);

                    if (updatedAt < oneDayAgo) {
                      console.log('Found product in cache....',item.sku)
                      return;
                    }
                } catch (error) {
                   
                }

              await getProductDetails(item.sku);
          })
      );
  }
}




const productsDetail = `
  id
  name
  sku
  url_key
  meta_title        
  meta_keyword
  meta_description 
  description{
    html
  }
`;
const fetchProductDetailURLKey = (productSKU) => `
query {
  products(filter: { sku: { eq: "${productSKU}" } }) {
aggregations {
  attribute_code
          label
          count
          options {
            count
            label
            value
          }
    } 
          total_count
    items {
    manufacturer
      name
			sku
   		url_key
      url_suffix
    canonical_url
      stock_status
      categories {
        url_key
        position
        name
      }
      __typename
    }
    items {
  ${productsDetail}
  special_price
      price_range {
  maximum_price{
    regular_price{
      value
    }
    final_price{
      value
    }
  }
  minimum_price {
    final_price {
      value
    }
    regular_price {
      value
    }
  }
}
      categories {
        name
        id
        url_key
        breadcrumbs {
          category_id
          category_name
        }
      }
               reviews {
        items {
          text
          created_at
          nickname
					summary
					average_rating
         ratings_breakdown {
                name
                value
          }
        }
      }
 			__typename
  ... on CustomizableProductInterface {
        options {
          title
          required
          
        }
      }
        ... on SimpleProduct{
          return_policy
       }
      ... on ConfigurableProduct {
        return_policy
        configurable_options {
          id
          attribute_id_v2
          attribute_code
          values {
            label
            value_index
            swatch_data {
              value
            }
          }
            
        }
      variants {
      attributes{
      code
      label
      value_index
    }
          product {
          ${productsDetail}
            price_range {
             maximum_price{
              regular_price{
                value
              }
              final_price{
                value
              }
              }
            }
            image{
              url
            }
           
            media_gallery {
              url
              label
              
            }
          }
        }
      }
         
      
      description{
        html
      }
        short_description{
        html
      }
      uid

      media_gallery{
        position
        url
        label
      }
        related_products{
  
      uid
      url_key
      id
      name
      sku
      image {
        url
      }
      media_gallery {
        url
        label
      }
      price {
        regularPrice {
          amount {
            value
            currency
          }
        }
      }
          price_range {
  maximum_price{
    regular_price{
      value
       currency
    }
    final_price{
      value
       currency
    }
  }
  minimum_price {
    final_price {
      value
       currency
    }
    regular_price {
      value
       currency
    }
  }
}
     
        	__typename
        
      }

          upsell_products{
       uid
              url_key
              id
              name
              sku
            image {
                url
                  }
            media_gallery {
            url
            label
                          }
            price {
            regularPrice {
            amount {
            value
            currency
                   }
                  }
           }
            price_range {
            maximum_price{
            regular_price{
            value
             currency
             }
             final_price{
              value
             currency
            }
            }
            minimum_price {
            final_price {
            value
            currency
            }
            regular_price {
            value
             currency
                          }
                            }
    }
     ... on SimpleProduct{
          return_policy
       }
     
        	__typename
          }
       crosssell_products {
     uid
              url_key
              id
              name
              sku
            image {
                url
                  }
            media_gallery {
            url
            label
                          }
            price {
            regularPrice {
            amount {
            value
            currency
                   }
                  }
           }
            price_range {
            maximum_price{
            regular_price{
            value
             currency
             }
             final_price{
              value
             currency
            }
            }
            minimum_price {
            final_price {
            value
            currency
            }
            regular_price {
            value
             currency
                          }
                            }
    }
     ... on SimpleProduct{
          return_policy
       }
     
        	__typename
    }
      image{
        url
      }
      price {
        regularPrice {
          amount {
            value
            currency
          }
        }
      }
      }
    }
  }`
async function getProductDetails(productSKU) {
  console.log('getProductDetails either not cached or updated yesterday....',productSKU)
  try {
      const query = fetchProductDetailURLKey(productSKU); 
      const response = await fetch(`${BASE_URL}/graphql/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query}),
      });
        
      if (response.ok) {
          const data = await response.json();
                  

      if (data?.data?.products?.items?.length > 0) {
          let productsData = JSON.parse(JSON.stringify(data.data.products));
          let pageData = await getProducts(productsData);

          if (!pageData?.product) {
              console.warn(`Product data not found for SKU: ${productSKU}`);
              return null;
          }

          const productData = pageData.product|| null;;
          const aggregations = pageData.aggregations|| [];
          const reviews = await fetchAllReviewValue() || null

          let returnData={
            props: {
              productData,
              aggregations,
              reviews,
            },
          }


          // Generate hash-based filenames
          const cacheUrlKeyFileName = createHash('md5')
              .update(pageData.product.url_key + '.html')
              .digest('hex')
              .slice(0, 12);
              const __filename = fileURLToPath(import.meta.url);
              const __dirname = dirname(__filename);

           // Assuming `cacheUrlKeyFileName` is the unique file name (like 'de55f792d634')
              const prooutputDir = path.resolve(__dirname, `../cacheM/product/${cacheUrlKeyFileName}.json`);

              // Check if the directory exists, create it if not
              const dirPath = path.dirname(prooutputDir);
              try {
                  await fs.mkdir(dirPath, { recursive: true });
              } catch (error) {
                  console.error('Error creating directory:', error);
              }

              try {
                  await fs.writeFile(prooutputDir, JSON.stringify(returnData));
                
              } catch (error) {
                 
              }

          
          return returnData;
      } else {
          console.warn(`No product found for SKU: ${productSKU}`);
          return null;
      }
    }else{
          console.warn(`No product found for SKU: ${productSKU}`);
          return null;
    }
  } catch (error) {
      console.error(`Error fetching product details for SKU: ${productSKU}`, error);
      return null;
  }
}




async function fetchAllReviewValue(){

  

try {
  const ReviewsAllValues = `
  query {
    productReviewRatingsMetadata {
      items {
        id
        name
        values {
          value_id
          value
        }
      }
    }
  }
    `
            const response = await fetch(`${BASE_URL}/graphql/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query: ReviewsAllValues}),
          });
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
              return []
                 
            }
        } catch (error) {
             
          return []
        }
}


async function getProducts(productsResult) {
  let responseData = {};  // Fix: Use an object instead of an array

  try {
      const aggregationsList = productsResult.aggregations || [];
      let { filters, optionValueMap } = await createFiltersFromAggregations(aggregationsList);
      let configuredProducts = await createProductsFromMagProducts(productsResult.items, filters, optionValueMap);
      const productData = configuredProducts[0] || null;
      const aggregations = productsResult.aggregations || [];
    
      
      responseData.product = {
          ...productData,  // Spread existing product details
          magData: productsResult.items[0],
          aggregations: aggregations
      };

      return responseData;
  } catch (error) {
      console.error("Error processing products:", error);
      return { error: "Failed to process product data", product: null };
  }
}

async function getCustomAttributes(aggregations, urlKey) {
  try {
      if (!aggregations || aggregations.length === 0) {
          console.warn("No aggregations provided.");
          return {};
      }

      // Extract attribute codes (excluding 'price' and 'category_id')
      const attributeCodes = aggregations
          .filter(attr => attr.attribute_code !== "price" && attr.attribute_code !== "category_id")
          .map(attr => attr.attribute_code)
          .join(", ");

      if (!attributeCodes) {
          console.warn("No valid attributes to fetch.");
          return {};
      }

      // Construct GraphQL query
      const attributesQuery = `
          query { 
              products(filter: {sku: {eq: "${urlKey}"}}) { 
                  items { ${attributeCodes} } 
              } 
          }`;

      // Fetch data from Magento
      const response = await client.query({
          query: gql`${attributesQuery}`
      });

      // Extract product attributes
      return response?.data?.products?.items?.[0] || {};
  } catch (error) {
      console.error(`Error fetching custom attributes for ${urlKey}:`, error);
      return {};
  }
}






