import CategoriesProducts from '@/components/Category/CategoriesProducts'
import CategoryHeader from '@/components/Category/CategoryHeader'
import Content from '@/components/Category/Content'
import CollectionBreadCrumbs from '@/components/Collection/CollectionBreadCrumbs'
import CollectionContent from '@/components/Collection/CollectionContent'
import CollectionHeader from '@/components/Collection/CollectionHeader'
import CollectionListing from '@/components/Collection/CollectionListing'
import CollectionReletatedProducts from '@/components/Collection/CollectionReletatedProducts'
import SubCollectionListing from '@/components/Collection/SubCollectionListing'
import { Client } from '@/graphql/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect ,useState} from 'react'


import ProductDetail from '../../components/ProductDetail/ProductDetail';
import ReviewSection from '../../components/ProductDetail/ReviewSection';

import ReletedProducts from '../../components/ProductDetail/ReletedProducts';


import { createFiltersFromAggregations, createProductsFromMagProducts } from '../../components/ConfigureProduct';
import fs from 'fs/promises';
  import path from 'path';
  import { createHash } from 'crypto';
// Define the types for the collection data
interface CollectionProps {
  collection: {
    name: string;
    description?: string;
    [key: string]: any;
  };
}

// =======================Category Schema Component========================= 

const CategorySchema = ({ category, url }: any) => {

  return (

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "CollectionPage",
          "name": category?.meta_title ? category?.meta_title : category?.name,
          "description": category?.meta_description,
          "image": category?.image || '/default-image.jpg',
          "url": `${process.env.baseURLWithoutTrailingSlash}${url?.slug}`
        }),
      }}
    />

  );
};


// BreadcrumbList Schema Component
const BreadcrumbSchema = ({ breadcrumbs }: any) => {
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb?.name,
      "item": index === 0
        ? `${process.env.baseURLWithoutTrailingSlash}${breadcrumb?.path}`
        : `${process.env.baseURLWithoutTrailingSlash}${breadcrumb?.path}/`, // Adds a trailing slash for other items
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbList),
      }}
    />
  );
};


// ============================Product Schema Component======================================


const ProductSchema = ({ product, aggregations, schemaImage, price, metaDiscription }: any) => {

  const getBrandName = () => {

    const brandAggregation = aggregations.find(
      (element: any) => element.attribute_code === 'brand'
    );
    const manufacturerAggregation = aggregations.find(
      (element: any) => element?.attribute_code === 'manufacturer'
    )
    // return brandAggregation ? brandAggregation.options[0].label : manufacturerAggregation?.options[0].label;
    return brandAggregation ? brandAggregation.options[0].label : '';
  };
  const extractTagValue = (prefix: string): string | null => {
    const tag = product.tags.find((tag: string) => tag.startsWith(prefix));
    return tag ? tag.split('--')[1] : null;
  };
  const material = extractTagValue('metal_type');
  const color = extractTagValue('dial_color');
  const reviews: any = product.reviews?.items || [];

  const aggregateRating =
    reviews.length > 0
      ? {
        "@type": "AggregateRating",
        "ratingValue": (
          reviews.reduce(
            (sum: number, review: any) => sum + review?.average_rating,
            0
          ) / reviews.length
        ).toFixed(1),
        "reviewCount": reviews.length,
        "bestRating": "100",
        "worstRating": "0",
      }
      : null;


  const reviewSchema = reviews.map((review: any) => ({

    "@type": "Review",
    "name": review?.summary,
    "reviewBody": review?.text,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review?.average_rating?.toString(),
      "bestRating": "100",
      "worstRating": "0",
    },
    "datePublished": review?.created_at,
    "author": { "@type": "Person", "name": review?.nickname },
  }));

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product?.meta_title ? product?.meta_title : product?.name,
    "sku": product?.sku,
    "mpn": product?.sku,
    "description": metaDiscription,
    "url": `${process.env.baseURL}product/${product?.url_key}/`,
    // "url": `${process.env.baseURL}${product?.url_key}.html`,
    "image": schemaImage,
    "brand": {
      "@type": "Brand",
      "name": getBrandName() || "Headora"
    },
    ...(!(!material || material.length === 0) && { material }),
    ...(!(!color || color.length === 0) && { color }),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "priceValidUntil": "2026-12-31T23:59:59Z",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": price,
          "currency": "USD"
        }
      }
    },
    ...(aggregateRating && { aggregateRating }),
    ...(reviewSchema?.length > 0 && { review: reviewSchema }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};



// ==========================================Static Paths =======================================

export const getStaticPaths: GetStaticPaths = async () => {
  const client = new Client();
  const allCategoriesPathFile = path.resolve(`./cacheM/topLevelCategoriesPath.json`);
  const allProductsPathFile = path.resolve(`./cacheM/allProductsPath.json`);
  try {
    let allCategories= JSON.parse(await fs.readFile(allCategoriesPathFile, 'utf-8'));
    let allProducts= JSON.parse(await fs.readFile(allProductsPathFile, 'utf-8'));
    const combinedPaths = [...allCategories, ...allProducts];

    const paths = combinedPaths.map((url: any) => {
        return { params: { slug: url } }  
    });
   let responseData = {
    paths,
    fallback: false,
  }

  return responseData;

  } catch (error) {
    
  }
  try{
    //console.log('/////////////////////getStaticPaths////////////')
    const response = await client.fetchCategories();
    const allUrl = response?.data?.categories?.items?.[0];
    const paths = allUrl.children.map((item: { url_path: string }) => {
            // Ensure the slug is an array of values
            return {
              params: {
                slug: item.url_path, // Split slug by '/' to get an array (e.g., ['product', 'green-t-shirt'])
              },
            };
          });

        
    let responseData = {
          paths,
          fallback: false,
        }
   
    return responseData;
  } catch (error) {
    return {
      paths: [],
      fallback: false,
    };
  }
}



// Static Props
export const getStaticProps: GetStaticProps = async ({params, query}:any) => {
  const { slug } = params as { slug: string;};
  const urlPath=slug
  
  //console.log('///Build///-',urlPath)
  const cacheStaticProps= createHash('sha1')
  .update(urlPath)
  .digest('hex')
  .slice(0, 12); 


  

  const cacheStaticPropsPath= path.resolve(`./cacheM/category/${cacheStaticProps}.json`)
  const cacheProductPropsPath= path.resolve(`./cacheM/product/${cacheStaticProps}.json`)
  //console.log('cacheStaticProps',cacheStaticProps)
  try {
    const cachePaths = [
      path.resolve(`./cacheM/category/${cacheStaticProps}.json`),
      path.resolve(`./cacheM/product/${cacheStaticProps}.json`)
    ];

    for (const cachePath of cachePaths) {
      try {
        return JSON.parse(await fs.readFile(cachePath, 'utf-8'));
      } catch (error) {
        
      }
    }
  } catch (error) {
    
  }
  //console.log('///////Fetch From Server ///////')
  const client = new Client();
  
  const page = query?.page ? parseInt(query.page as string, 10) : 1; // Get page from query or default to 1

  const fetchCategoryByURLKey = async (urlKey: string, page: number) => {
    try {
    const response = await client.fetchSubCategoryDataByUrlKey(urlKey, page);
    return response?.categoryList[0] || null;
  } catch (error) {
    return null;
  }
};

try {
  
  const collectionData = await client.fetchCollectionPage(urlPath as string);
  const collection = collectionData?.data?.categoryList?.[0] || null;
  //console.log(collection,'collection')
  if(collection){
  const category = await fetchCategoryByURLKey(urlPath as string, page) || null;
  const uid = category?.uid || null;

  // Fetch products for the category by UID and page
  let allProduTList: any[] = []
  const fetchProductsByUID = async (uid: string, currentPage: number) => {
        try {
        const response = await client.fetchSubCategoryData(uid, currentPage);
        return response || null;
      } catch (error) {
        return null;
      }
 };

  let productsRes = uid ? await fetchProductsByUID(uid, page) : null;
   
  if (productsRes.products) {

    productsRes.products.items.forEach((item: any) => {
      allProduTList.push(item)
    })
  }

  let responseData={
    props: {
      allProduTList,      
      category,           
      currentPage: page,  
      productsRes,        
      collection,     
    
    }
  }

  await fs.writeFile(cacheStaticPropsPath, JSON.stringify(responseData));
  return responseData;
  }else{
    //console.log('not a category url... try with fetch product')
    const product = await client.fetchProductDetail(urlPath.replaceAll('.html',''));
    let productsResult = product.data.products || null
    const reviews = await client.fetchAllReviewValue() || null
     const ReturnDataCMSBlock = await client.fetchPDPReturnCMSBlock() || null; 
    let { filters, optionValueMap } =  createFiltersFromAggregations(productsResult.aggregations);
    let configuredProducts =  createProductsFromMagProducts(productsResult.items, filters, optionValueMap);
    const productData = configuredProducts[0] || null;
    const aggregations = productsResult.aggregations || [];
 
    let responseData={
      props: {
        productData,
        aggregations,
        reviews,
         ReturnDataCMSBlock
      },
    }
    
    await fs.writeFile(cacheProductPropsPath, JSON.stringify(responseData));
    return responseData;
  }
} catch (error) {
  return {
    props: {
      allProduTList: [],  
      category: null,     
      currentPage: page,  
      productsRes: null,  
      collection: null,   
    },
  };
}
};



// Collection Component
const Collection = ({ allProduTList, category, productsRes, collection,categories,productData, aggregations, reviews, ReturnDataCMSBlock}: any) => {

  const [schemaImage, setSchemaImage] = useState<any>('')
  const [price, setPrice] = useState<any>()
  const [productBbreadcrumbs, setProductBbreadcrumbs] = useState<any>([]);
  const router = useRouter()
  const url = router.query
  // ===========================BreadCrumbs Management=======================================

  const { slug, slug2, slug3, ...rest } = router.query;

  // Get all slugs from query
  const slugs = [slug, slug2, slug3, ...Object.values(rest)].filter(Boolean);

  const findCategoryName = (key: string, items?: any): string | null => {
    if (!Array.isArray(items)) return null; // Ensure items is an array

    for (const item of items) {
      if (item.url_key === key) {
        return item.name;
      }
      if (item.children) {
        const result = findCategoryName(key, item?.children);
        if (result) return result;
      }
    }
    return null;
  };
  
 // Create breadcrumb array dynamically by matching slugs to category names
 const breadcrumbs = [
  { name: 'Home', path: '' },
  ...slugs.map((slugPart: any, index) => ({
    name: findCategoryName(slugPart, categories?.data?.categories?.items) || slugPart.replace(/-/g, ' '),
    path: `/${slugs.slice(0, index + 1).join('/')}`,
  })),
];
  // Store breadcrumbs in session storage on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs));
    }
  }, [breadcrumbs]);


  useEffect(() => {
    // Retrieve breadcrumbs data from sessionStorage on the first render
    if (typeof window !== 'undefined') {
      const storedBreadcrumbs = sessionStorage.getItem('breadcrumbs');
      if (storedBreadcrumbs) {
        setProductBbreadcrumbs(JSON.parse(storedBreadcrumbs));
        // Clear breadcrumbs from sessionStorage
        sessionStorage.removeItem('breadcrumbs');
      }
    }
  }, []);
//new commit//
// ---------------------CategoriesProducts and Collection Meta Details------------------------------------

  const CategoryImage = collection?.image || '/default-image.jpg'
  const fileExtension = CategoryImage.split('.').pop()?.toLowerCase() || "jpg";

  const description = collection?.description || null
  const shortDescription = collection?.short_description || null
  const CollectionDescription = collection?.description || null
  //console.log(collection,'collection check')
  //console.log(productData,'productData check')



  // -------------------------------------Product Detail Meta Details-------------------------------------------
  function getMetaDescription(description: any) {
    let htmlData = description.html ? description.html : description
    htmlData = htmlData + ' '
    htmlData = htmlData.replaceAll(/(?:\r\n|\r|\n)/g, '<br>')
    htmlData = htmlData.replaceAll('<br><br>', '<br>')
    htmlData = htmlData.replaceAll('</p><br><p>', '</p><p>')
    htmlData = htmlData.replace(/<style[^>]*>.*<\/style>/g, '')
      // Remove script tags and content
      .replace(/<script[^>]*>.*<\/script>/g, '')
      // Remove all opening, closing and orphan HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove leading spaces and repeated CR/LF
      .replace(/([\r\n]+ +)+/g, '');

    return htmlData.slice(0, 160)
  }


  const metaDiscription = productData 
  ? typeof productData.meta_description === "string" && productData.meta_description.trim() !== ""
    ? productData.meta_description
    : getMetaDescription(
        typeof productData.short_description === "string"
          ? productData.short_description
          : typeof productData.short_description?.html === "string"
            ? productData.short_description.html
            : typeof productData.description === "string"
              ? productData.description
              : typeof productData.description?.html === "string"
                ? productData.description.html
                : ""
      )
  : "";



  if(!productData){
  
    return (
    <>
    
      <Head>
      <meta charSet="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

      <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.baseURLWithoutTrailingSlash}/${slug}`}/>

        <title>{collection?.meta_title || collection?.name}</title>
        <meta name="title" content={collection?.meta_title || collection?.name}/>
        {collection?.meta_description && (
          <meta name="description" content={collection?.meta_description}/>
        )}
        {collection?.meta_keywords && (
          <meta name="keywords" content={collection?.meta_keywords}/>
        )}
 


        <meta property="og:type" content="category"/>
        <meta property="og:title" content={collection?.meta_title || collection?.name}/>
        {collection?.meta_description && (
        <meta property="og:description" content={collection?.meta_description}/>
        )}
        <meta property="og:image" content={CategoryImage}/>
        <meta property="og:image:secure_url" content={CategoryImage}/>
        <meta property="og:image:width" content="800"/>
        <meta property="og:image:height" content="800"/>
        <meta property="og:image:type" content={`image/${fileExtension}`}/>
        <meta property="og:url" content={`${process.env.baseURLWithoutTrailingSlash}/${slug}`}/>
        <meta property="og:site_name" content="Headora"/>


        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={collection?.meta_title || collection?.name}/>
        {collection?.meta_description && (
        <meta name="twitter:description" content={collection?.meta_description}/>
        )}
        <meta name="twitter:image" content={CategoryImage}/>
      </Head>

      
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      <CategorySchema category={collection} url={url}/>
      {category?.display_mode === "PAGE" ? (
        <>
          <CollectionHeader Data={collection} />
          <CollectionBreadCrumbs Data={collection} />
          <CollectionListing Collection={collection} />
          <CollectionReletatedProducts Data={category} Collection={collection} />
          {/* <CollectionContent BlogContent={BlogContent}/> */}
          <Content description={CollectionDescription}/>
        </>
      ) : (
        <>
          <CategoryHeader Data={{ name: category?.name, description:category?.short_description }} categories={categories}/>
          <CategoriesProducts
            Data={{ name: category?.name }}
            categoryDetail={category}
            categoriesData={productsRes}
            productsData={allProduTList}
          />
          <Content description={category?.description} />
          
        </>
      )}
    </>
  );
}else{

  return (
<>
<Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Robots */}
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.baseURLWithoutTrailingSlash}/${slug}`} />
        {/* Title and Canonical */}
        <title>{productData?.meta_title ? productData?.meta_title : productData?.name} </title>


        {/* SEO Meta Tags */}
        <meta name="title" content={`${productData?.meta_title ? productData?.meta_title : productData?.name}`} />
        <meta name="description"
          content={metaDiscription}
        />
        <meta name="keywords" content={productData?.meta_keyword ? productData?.meta_keyword : 'luxyverse'} />

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${productData?.meta_title ? productData?.meta_title : productData?.name}`} />
        <meta property="og:description"
          content={
            metaDiscription
          }
        />
        <meta property="og:url" content={`${process.env.baseURL}product/${productData?.url_key}/`} />
        <meta property="og:site_name" content="Luxverse" />
        <meta property="og:image" content={schemaImage} />
        <meta property="og:image:secure_url" content={schemaImage} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content={`image/${fileExtension}`} />
        <meta property="og:price:amount" content={price} />
        <meta property="og:price:currency" content="USD" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${productData?.meta_title ? productData?.meta_title : productData?.name}`} />
        <meta name="twitter:description"
          content={metaDiscription}
        />
        <meta name="twitter:image" content={schemaImage} />

        {/* Schema.org Meta Tags */}
        <meta itemProp="name" content={productData?.name} />
        <meta itemProp="description"
          content={metaDiscription}
        />
        <meta itemProp="image" content={schemaImage} />
      </Head>

        {/* <BreadcrumbSchema breadcrumbs={breadcrumbs} products={productData} /> */}
        {/* <ProductSchema product={productData} aggregations={aggregations} schemaImage={schemaImage} price={price} metaDiscription={metaDiscription} /> */}
        <ProductDetail 
        setSchemaImage={setSchemaImage} 
        Data={productData} 
        aggregations={aggregations} 
        categories={categories} 
        breadcrumbs={productBbreadcrumbs} 
        setPrice={setPrice} 
        ReturnDataCMSBlock={ReturnDataCMSBlock}/>
        <ReviewSection Data={productData} AllReviews={reviews} />
        <ReletedProducts Data={productData} />
        </>
  );
}
}

export default Collection;
