
import React, { useState } from 'react';
import styles from '../../styles/ProductDetail.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Currency } from '../Currency/currency';

function UpSellProducts({ Data }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);


  // If upsell_products length is 0, don't render the component
  if (!Data?.upsell_products || Data.upsell_products.length === 0) {
    return null;
  }

  const itemsToShow = 5; // Number of items to show in the slider

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Data?.upsell_products?.length - itemsToShow : prevIndex - 1
    );
  };


  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === Data?.upsell_products?.length - itemsToShow ? 0 : prevIndex + 1
    );
  };

  function regularPrice(item: any) {
    let final_price = item?.price_range?.maximum_price?.final_price?.value.toLocaleString();
    let regular_price = item?.price_range?.maximum_price?.regular_price?.value.toLocaleString();
    let currency: any = item?.price?.regularPrice?.amount?.currency;
    if (regular_price != final_price) {
        return `${Currency[currency]}${regular_price}`
    } else {
        return ''
    }
}
function finalPrice(item: any) {
    let final_price = item?.price_range?.maximum_price?.final_price?.value?.toLocaleString();
    let currency: any = item?.price?.regularPrice?.amount?.currency
    return `${Currency[currency]}${final_price}`
}

function getconfigurablePrice(item: any) {
    let price = item?.price_range?.maximum_price?.regular_price?.value?.toLocaleString();
    let regular_price = item?.price_range?.maximum_price?.regular_price?.value?.toLocaleString();
    let currency: any = item?.price_range?.maximum_price?.regular_price?.currency;

    if (regular_price != price) {
        return `${Currency[currency]} ${price}`;
    } else {
        return ''
    }
}

function configurableFinalPrice(item: any) {
    let final_price = item?.price_range?.maximum_price?.final_price?.value?.toLocaleString();
    let currency: any = item?.price_range?.maximum_price?.regular_price?.currency;
    return `${Currency[currency]}${final_price}`
}

  return (
    <>
    <div className={styles.relatedProductsContainer}>
      <h3 className={styles.title}>UP SELL PRODUCTS YOU MAY LIKE</h3>
      <div className={styles.slider}>
                <button className={styles.prevButton} onClick={handlePrev}>
                    <Image src="/Images/leftGoldenArrow.png" alt="Left Arrow"
                        width={50} // set width appropriately
                        height={50} // set height appropriately
                    />
                </button>
                <div className={styles.productsContainer}>
                    <div
                        className={styles.productsGrid}
                        style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                    >
                        {Data?.upsell_products.slice(0, 10).map((product: any) => {
let selectedVariant = null;

if (product?.__typename === "ConfigurableProduct") {
  const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index;
  selectedVariant = product?.variants.find((variant: any) =>
    variant.attributes.some((attribute: any) => attribute.value_index === optionValueIndex)
  );
}

const variantProduct = selectedVariant?.product || product;

                            return(

                            <div key={product.uid} className={styles.productItem}>
                                <Link  href={`/${product?.url_key}.html`}>
                                    <Image
                                       src={
                                           variantProduct?.image?.url?.includes("placeholder")
                                ? variantProduct?.media_gallery?.[0]?.url?.includes("cache")
                                  ? variantProduct.media_gallery[0].url.replace(/\/cache\/.*?\//, "/")
                                  : variantProduct.media_gallery?.[0]?.url
                                : variantProduct?.image?.url
                                  ? variantProduct.image.url.includes("cache")
                                    ? variantProduct.image.url.replace(/\/cache\/.*?\//, "/")
                                    : variantProduct.image.url
                                  : "/Images/productplaceholder.png"
                                      }
                                        alt={variantProduct.name}
                                        className={styles.productImage}
                                        width={300} // set width appropriately
                                        height={300} // set height appropriately
                                    />
                                    <p className={styles.productName}>{variantProduct.name}</p>
                                    <p className={styles.RelatedPrice}>
                          <span className={styles.special}>
                            {product.__typename === "ConfigurableProduct"
                              ? configurableFinalPrice(selectedVariant?.product)
                              : finalPrice(variantProduct)}
                          </span>
                          <span className={styles.regular}>
                            {product.__typename === "ConfigurableProduct"
                              ? getconfigurablePrice(selectedVariant?.product)
                              : regularPrice(variantProduct)}
                          </span>
                        </p>
                                </Link>
                            </div>

                         ) }
                        )}

                    </div>
                </div>
                <button className={styles.nextButton} onClick={handleNext}>
                    <Image src="/Images/rightGoldenArrow.png" alt="arrow" width={20} height={30} />
                </button>
            </div>
            {/* <span className="loader"></span> */}
    </div>
    
    </>
  );
}

export default UpSellProducts;
