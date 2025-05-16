
import Filter from '@/components/Filters/Filter'
import CategoryHeader from '@/components/Category/CategoryHeader'
import { Client } from '@/graphql/client';
import CategoriesProducts from '@/components/Category/CategoriesProducts';
import { GetStaticPaths } from 'next';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import Head from 'next/head'
import Content from '@/components/Category/Content';
import { useRouter } from 'next/router';

import fs from 'fs/promises';
  import path from 'path';
  import { createHash } from 'crypto';
const CategorySchema = ({ category, url }: any) => {
  // if (!category || !category.name || !category.description || !category.image) {
  //   return null;
  // }

  return (

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "CollectionPage",
          "name": category?.meta_title ? category?.meta_title : category?.name,
          "description": category?.meta_description,
          "image": category?.image,
          "url": `${process.env.baseURLWithoutTrailingSlash}${url}`
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
      : `${process.env.baseURLWithoutTrailingSlash}${breadcrumb?.path}`, 
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

export const getStaticPaths: GetStaticPaths = async () => {

  const allCategoriesPathFile = path.resolve(`./cacheM/thirdLevelCategoriesPath.json`);
    try {
      let allCategories= JSON.parse(await fs.readFile(allCategoriesPathFile, 'utf-8'));
      const paths = allCategories.map((url: any) => {
        let urlPath = url.split('/');
        return { 
          params: { 
              slug: urlPath[0] || '',
              slug2: urlPath[1] || '',
              slug3: urlPath[2] || ''
            } 
          }  // Single segment case
            

    });
     let responseData = {
      paths,
      fallback: false,
    }
  
    return responseData;
  
    } catch (error) {
      
    }
  const client = new Client();

  const fetchAllCategories = async () => {
    const response = await client.fetchSSGSubCategoryData();
    return response?.categories?.items[0];
  };

  const categories = await fetchAllCategories();
  let paths: { params: { slug: any; slug2: any; slug3?: any } }[] = [];
 if (categories?.children) {
    categories.children.forEach((category: any) => {
      if (category.children) {
        category.children.forEach((subCategory: any) => {
          if (subCategory?.children) {
            subCategory.children.forEach((subSubCategory: any) => {

              if (subSubCategory.url_path) {
                let urlPath =subSubCategory.url_path.split('/')
                paths.push({
                  params: { slug: urlPath[0], slug2: urlPath[1], slug3: urlPath[2] }
                });
              }
            })
          }

        });
      }
    });
  }
  let responseData = {
    paths,
    fallback: false,
  }
  return responseData;
};



export const getStaticProps: GetStaticProps = async ({ params, query }: any) => {
  const { slug,slug2,slug3 } = params as { slug: string ,slug2: string,slug3: string;};
  const urlPath=slug+'/'+slug2+'/'+slug3
  //console.log('/////////////////////getStaticProps////////////slug3:-',urlPath)
    const cacheStaticProps= createHash('sha1')
      .update(urlPath)
      .digest('hex')
      .slice(0, 12); 
      const cacheStaticPropsPath= path.resolve(`./cacheM/category/${cacheStaticProps}.json`)
      
      try {
        let responseData= JSON.parse(await fs.readFile(cacheStaticPropsPath, 'utf-8'));
        return responseData;
      } catch (error) {
        
      }
  

  const client = new Client();

  // Handle slug and page from params and query
  const page = query?.page ? parseInt(query.page as string, 10) : 1;



  // Fetch category data based on URL key
  const fetchCategoryByURLKey = async (urlKey: string, page: number) => {
    try {
    const response = await client.fetchSubCategoryDataByUrlKey(urlKey, page);
    return response?.categoryList[0] || null;
  } catch (error) {
    return null;
  }
  };
  try {
  const category = await fetchCategoryByURLKey(urlPath as string, page);


  const uid = category.uid || null;

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

  let productsRes = await fetchProductsByUID(uid, page);
  if (productsRes.products) {
    productsRes.products.items.forEach((item: any) => {
      allProduTList.push(item)
    })
   
  }

  let responseData={
        props: {
          allProduTList,       // Products data
          category,            // Category data
          currentPage: page,   // Current page number
          productsRes,         // Product response data
        }
      }
      await fs.writeFile(cacheStaticPropsPath, JSON.stringify(responseData));
      return responseData;

  
} catch (error) {
  return {
    props: {
      allProduTList: [],  // Empty products list
      category: null,     // Null category data
      currentPage: page,  // Current page number
      productsRes: null,  // Null product response
    },
  };
}
};

const Subcategory = ({ allProduTList, category, productsRes,categories }: any) => {

  const router = useRouter()
  const url = router.asPath

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
        const result = findCategoryName(key, item.children);
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
  return (
    <>
      <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
 
        <meta name="robots" content="index, follow"/>
        <link rel="canonical" href={`${process.env.baseURLWithoutTrailingSlash}${url}`}/>

        
        <title>{category?.meta_title ? category?.meta_title : category?.name}</title>
        <meta name="title" content={`${category?.meta_title || category?.name}`}/>
        {category?.meta_description && (
          <meta name="description" content={category?.meta_description}/>
        )}
        {category?.meta_keywords && (
          <meta name="keywords" content={category?.meta_keywords}/>
        )}
   
        <meta property="og:title" content={`${category?.meta_title || category?.name}`}/>
        {category?.meta_description && (
        <meta property="og:description" content={category?.meta_description}/>
        )}
        <meta property="og:url" content={`${process.env.baseURLWithoutTrailingSlash}${url}`}/>
        <meta property="og:type" content="category"/>


        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={`${category?.meta_title || category?.name}`}/>
        {category?.meta_description && (
        <meta name="twitter:description" content={category?.meta_description}/>
        )}
      </Head>
      <CategorySchema category={category} url={url}/>
        <BreadcrumbSchema breadcrumbs={breadcrumbs}/>

          <CategoryHeader Data={{ name: category?.name, description:category?.short_description }} categories={categories}/>

      <CategoriesProducts
        Data={{ name: category?.name }}
        categoriesData={productsRes}
        productsData={allProduTList}
        categoryDetail={category}
      />
      <Content description={category?.description} />
 
    </>
  );
};

export default Subcategory;