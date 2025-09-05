/* eslint-disable jsx-a11y/alt-text */
import React, { useCallback, useEffect, useState } from "react";
import styles from "../../styles/ProductDetail.module.css";
import { Currency } from "../Currency/currency";
import PDPSkeletonLoader from "./SkilitonLoader";

import ShortDescription from "./ShortDescription";
import Image from "next/image";
import GallerySection from "./GallerySection";
import AttributeSlider from "./AttributeSlider";
import {
  processAffirmPrice,
  affirmUpdate,
  getFilePath,
  getFormattedCurrency,
  strToArray,
  validateConfigurations,
  setCookie,
  getCookie,
  updateProduct,
  standardizeValue,
} from "../../components/ConfigureProduct";
import Link from "next/link";
import { useRouter } from "next/router";
import { Client } from "@/graphql/client";
import MakeAOffer from "../Modals/MakeAOffer";
import ShortDescriptionNavBars from "./ShortDescriptionNavBars";
import { manufacturer } from "../Category/ManufacturerData"




function ProductDetail({
  Data,
  aggregations,
  categories,
  breadcrumbs,
  ReturnDataCMSBlock,
  showRibbon
}: any) {
  // console.log(Data,'Data')
  if (!Data) return null;
  const router = useRouter();

  const [showMoadal, setShowMoadal] = useState<any>(false);

  const [moadalHeading, setMoadalHeading] = useState<any>("");
  const [moadalMessage, setmMadalMessage] = useState<any>("");

  const [quantity, setQuantity] = useState<any>(1);
  const [disabledOptions, setDisabledOptions] = useState<any>([]);
  const [selectedOptions, setSelectedOptions] = useState<any>({});

  const [prevSelectedOptions, setPrevSelectedOptions] = useState<any>({});
  const [activeFilters, setActiveFilters] = useState<any>([]);

  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(
    currentVariant?.media_gallery?.[0]?.url || Data?.image?.url
  );
  const [SelectedOptionsID, setSelectedOptionsID] = useState<any>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [addToLoading, setAddToLoading] = useState<any>(false);
  const [activeImage, setActiveImage] = useState<any>(0);
  const [isMobile, setIsMobile] = useState<any>(false);
  const [cartError, setCartError] = useState<any>(0);

  const [affirmShow, setAffirmShow] = useState<any>(false);
  const [affirmPrice, setAffirmPrice] = useState<any>("");
  const [brandname, setBrandname] = useState<any>("Headora");
  const [stockStatus, setStockStatus] = useState(null);
  const [loadingStockStatus, setLoadingStockStatus] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // ==================================Wishlist Functionality=================================================== 

  const [wishlistLoading, setWishlistLoading] = useState<{ [key: string]: boolean }>({})
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null)
  const [wishlistId, setWishlistId] = useState<any>(null)
  const [wishlistItems, setWishlistItems] = useState<any>({})
  const [wishlistItemsLoading, setWishlistItemsLoading] = useState<boolean>(false)
  const [wishlistItemIds, setWishlistItemIds] = useState<{ [productId: string]: number }>({})
  const [showModal, setShowModal] = useState<any>(false)
  const [modalHeading, setModalHeading] = useState<any>("")
  const [modalMessage, setModalMessage] = useState<any>("")
  // Wishlist Functionality
  const syncWishlistItems = async () => {
    if (!userLoggedIn) return
    try {
      const wishlistData = await client.fetchWishListProductsList()
      if (wishlistData?.data?.customer?.wishlists?.length > 0) {
        const wishlist = wishlistData.data.customer.wishlists[0]
        const wishlistProducts = wishlist.items_v2?.items || []
        const wishlistSkuMap: { [sku: string]: boolean } = {}
        const wishlistSkuToItemIdMap: { [sku: string]: number } = {}
        wishlistProducts.forEach((item: any) => {
          if (item.product?.sku) {
            wishlistSkuMap[item.product.sku] = true
            wishlistSkuToItemIdMap[item.product.sku] = item.id
          }
        })
        const updatedWishlistItems: { [productId: string]: boolean } = {}
        const updatedWishlistItemIds: { [productId: string]: number } = {}
        Data.forEach((productItem: any) => {
          const product = productItem
          let variantProduct = product
          if (product?.__typename === "ConfigurableProduct") {
            const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index
            const selectedVariant = product?.variants.find((variant: any) =>
              variant.attributes.some((attribute: any) => attribute.value_index === optionValueIndex),
            )
            variantProduct = selectedVariant?.product || product
          }
          if (variantProduct.sku && wishlistSkuMap[variantProduct.sku]) {
            updatedWishlistItems[variantProduct.id] = true
            updatedWishlistItemIds[variantProduct.id] = wishlistSkuToItemIdMap[variantProduct.sku]
          }
        })
        setWishlistItems(updatedWishlistItems)
        setWishlistItemIds(updatedWishlistItemIds)
      }
    } catch (error) {
      console.error("Error syncing wishlist items:", error)
    }
  }

  const checkUserLogin = async () => {
    try {
      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        console.log("Skipping user sync on localhost")
        return
      }
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Network response was not ok")
      const user = await response.json()
      if (user.logged_in) {
        setUserLoggedIn(true)
        await fetchWishlistId()
      } else {
        setUserLoggedIn(false)
      }
    } catch (error) {
      console.error("Error checking user login status:", error)
      setUserLoggedIn(false)
    }
  }

  const fetchWishlistId = async () => {
    try {
      const wishlistData = await client.fetchWishListID()
      if (wishlistData?.data?.customer?.wishlist?.id) {
        setWishlistId(wishlistData.data.customer.wishlist.id)
      }
    } catch (error) {
      console.error("Error fetching wishlist ID:", error)
    }
  }

  const handleWishlist = async (productSku: string, productId: string) => {
    setWishlistLoading((prev) => ({ ...prev, [productId]: true }))
    try {
      if (userLoggedIn === null) {
        await checkUserLogin()
      }
      if (!userLoggedIn) {
        router.push("/customer/account/login/")
        return
      }
      if (!wishlistId) {
        await fetchWishlistId()
      }
      if (wishlistId) {
        const result = await client.fetchWishlistMutation(productSku, wishlistId)
        if (result?.data?.addProductsToWishlist?.wishlist) {
          setModalHeading("Success!")
          setModalMessage("Product added to wishlist successfully!")
          setShowModal(true)
          setTimeout(() => {
            setShowModal(false)
          }, 4000)
          setWishlistItems((prev: any) => ({
            ...prev,
            [productId]: true,
          }))
        } else {
          setModalHeading("Error!")
          setModalMessage("Failed to add product to wishlist. Please try again.")
          setShowModal(true)
        }
      } else {
        setModalHeading("Error!")
        setModalMessage("Unable to access wishlist. Please try again.")
        setShowModal(true)
        setTimeout(() => {
          setShowModal(false)
        }, 4000)
      }
    } catch (error) {
      console.error("Error handling wishlist:", error)
      setModalHeading("Error!")
      setModalMessage("Something went wrong. Please try again later.")
      setShowModal(true)
      setTimeout(() => {
        setShowModal(false)
      }, 4000)
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const handleRemoveWishlist = async (itemId: number) => {
    try {
      setWishlistLoading((prev) => ({ ...prev, [itemId]: true }))
      const response = await client.fetchRemoveWishlistMutation(wishlistId, itemId)
      if (response?.data?.removeProductsFromWishlist?.wishlist) {
        const updatedItems = { ...wishlistItems }
        delete updatedItems[itemId]
        setWishlistItems(updatedItems)
        syncWishlistItems()
      } else {
        console.error("Failed to remove from wishlist")
      }
    } catch (error) {
      console.error("Error removing from wishlist", error)
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  useEffect(() => {
    checkUserLogin()
  }, [])

  useEffect(() => {
    if (userLoggedIn && Data.length > 0) {
      syncWishlistItems()
    }
  }, [userLoggedIn, Data, showRibbon])


  // ======================================WishList End 
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper function to generate the current product URL
  const generateProductUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href
    }
    // Fallback for SSR
    const router = useRouter()
    return `${process.env.baseURLWithoutTrailingSlash}${router.asPath}`
  }

  // Helper function to get product image URL
  const getProductImageUrl = () => {
    const imageUrl = currentVariant?.media_gallery?.[0]?.url || Data?.image?.url
    if (imageUrl && typeof window !== "undefined") {
      // Convert relative URL to absolute URL
      return imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`
    }
    return imageUrl
  }

  // Helper function to get product name for sharing
  const getProductName = () => {
    return Data.__typename === "ConfigurableProduct" ? currentVariant?.variant_name || Data?.name : Data?.name
  }


  // Limit Data.name to 50 characters and add ellipsis if necessary
  const displayName =
    Data.name.length > 30 ? `${Data.name.slice(0, 50)}...` : Data.name;
  const client = new Client();

  const fetchStockData = async () => {
    setLoadingStockStatus(true);
    try {
      const data = await client.fetchStockStatus(Data?.url_key);
      if (data) {
        setStockStatus(data?.products?.items?.[0]?.stock_status); // Adjust based on response structure
      } else {
      }
    } catch (err) {
    } finally {
      setLoadingStockStatus(false);
    }
  };
  useEffect(() => {
    fetchStockData();
  }, []);

  // Price for meta

  // ==============Brand Logic=================
  useEffect(() => {
    let found = false;

    aggregations.forEach((element: any) => {
      if (element.attribute_code === "brand" && element.options[0]?.label) {
        setBrandname(element.options[0].label);
        found = true;
      }
    });

    if (!found) {
      aggregations.forEach((element: any) => {
        if (
          element.attribute_code === "manufacturer" &&
          element.options[0]?.label
        ) {
          setBrandname(element.options[0].label);
        }
      });
    }
  }, [aggregations]);

  // ===========Cookie Handler================
  useEffect(() => {
    if (window.innerWidth < 650) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth < 650) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    });
  }, []);

  function titleCase(str: any) {
    let returnString = "";
    var splitStr = str.toLowerCase().split(" ");
    splitStr.forEach((item: any) => {
      returnString =
        returnString + item.charAt(0).toUpperCase() + item.substring(1) + " ";
    });

    return returnString ? returnString : str;
  }

  useEffect(() => {
    let slugArray: any = router.query;
    if (Data && Data.configurable_options) {
      Data.configurable_options.forEach((configuration: any) => {
        if (slugArray[configuration.attribute_code]) {
          let optvalue = slugArray[configuration.attribute_code];
          optvalue = optvalue.replaceAll("_", " ");
          optvalue = titleCase(optvalue);

          setSelectedOptions((prevOptions: any) => ({
            ...prevOptions,
            [configuration.attribute_code]:
              selectedOptions[configuration.attribute_code] != optvalue
                ? optvalue
                : "",
          }));
        }
      });
    }

    // setSelectedOptions((prevOptions: any) => ({
    //   ...prevOptions,
    //   [attributeCode]: selectedOptions[attributeCode]!=optvalue?optvalue:'',
    // }));
  }, [router.query, Data]);

  const gotToReviews = () => {
    if (typeof document !== "undefined") {
      const element = document.getElementById("reviewssection");
      if (element) {
        const scrollDiv = element.offsetTop;
        window.scrollTo({ top: scrollDiv, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (showMoadal) {
      document.body.classList.add("modalOpen");
    } else {
      document.body.classList.remove("modalOpen");
    }
  }, [showMoadal]);

  const updateAffirm = async () => {
    let final_price =
      currentVariant?.priceRange?.maximum_price?.final_price?.value ||
      Data?.priceRange?.maximum_price?.final_price?.value;
    let affirm_show = await affirmUpdate(final_price);
    let affirm_price = await processAffirmPrice(final_price);
    setAffirmPrice(affirm_price);
    setAffirmShow(affirm_show);
  };

  useEffect(() => {
    if (Data?.__typename == "ConfigurableProduct") {
      setCartError(0);

      const OptionAttributeId: { [key: string]: string } = {};
      Data?.configurable_options.forEach((option: any) => {
        const selectedOption = selectedOptions[option.attribute_code];
        const selectedOptionValue = option.values.find(
          (value: any) => value.label === selectedOption
        );

        if (selectedOptionValue) {
          OptionAttributeId[option.attribute_id_v2] =
            selectedOptionValue.value_index;
          setSelectedOptionsID(OptionAttributeId);
        } else {
          setCartError(parseInt(cartError) + 1);
        }
      });
    }
  }, [selectedOptions]);

  useEffect(() => {
    if (Data?.__typename == "ConfigurableProduct") {
      setDefailtOption(0);
    }
  }, [Data]);

  useEffect(() => {
    setAffirmShow(false);
    updateAffirm();
  }, []);

  const setDefailtOption = async (index: any) => {
    let newIndex = parseInt(index);
    let allActiveFilters: any = [];
    let tag: any;
    const initialOptions: { [key: number]: string } = {};
    await Data?.configurable_options?.forEach((option: any, indx: any) => {
      if (indx === 0) {
        initialOptions[option.attribute_code] = option.values[0]?.label;
        tag =
          option.attribute_code +
          "--" +
          standardizeValue(option.values[0].label);

        allActiveFilters.push(tag);
      } else {
        initialOptions[option.attribute_code] = option.values[newIndex]?.label;
        tag =
          option.attribute_code +
          "--" +
          standardizeValue(option.values[newIndex].label);
        allActiveFilters.push(tag);
      }
    });
    getDisableOptions(allActiveFilters);
    let isValidConfiguration = await validateConfigurations(
      Data,
      allActiveFilters
    );

    if (isValidConfiguration) {
      setActiveFilters(allActiveFilters);
      setSelectedOptions(initialOptions);
      setPrevSelectedOptions(initialOptions);
    } else {
      let nextIndex = newIndex + 1;
      setDefailtOption(nextIndex);
    }
  };

  const getDisableOptions = (allActiveFilters: any) => {
    if (allActiveFilters && allActiveFilters.length > 0) {
      allActiveFilters.forEach(async (optionstring: any) => {
        let allDisableFilters: any = [];
        if (optionstring != "") {
          let optionArrayStr = strToArray(optionstring + "", "--");
          await Data?.configurable_options?.forEach(async (option: any) => {
            if (option.attribute_code !== optionArrayStr[0]) {
              await option.values.forEach(async (opt: any) => {
                let filters: any = [];
                let newTag =
                  option.attribute_code + "--" + standardizeValue(opt.label);
                filters.push(optionstring);
                filters.push(newTag);

                let isValidConfiguration = await validateConfigurations(
                  Data,
                  filters
                );
                if (!isValidConfiguration) {
                  if (
                    option.attribute_code != "dial_color" ||
                    option.attribute_code != "metal_type"
                  ) {
                    allDisableFilters = [...allDisableFilters, newTag];
                  }
                }
              });
            }
          });

          setDisabledOptions(allDisableFilters);
        }
      });
    } else {
      setDisabledOptions([]);
    }
  };

  useEffect(() => {
    // Only process variants for configurable products
    if (Data.__typename === "ConfigurableProduct") {
      getDisableOptions(activeFilters);
      let isValidConfiguration = true; // validateConfigurations(Data, activeFilters)
      if (isValidConfiguration) {
        let selectedVariant = updateProduct(Data, activeFilters);
        setCurrentVariant(Data.variants[selectedVariant]);
      }
    } else {
      // Clear currentVariant for simple products
      setCurrentVariant(null);
    }
  }, [activeFilters, Data]);

  const generateVideoThumbnail = (file: any) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      // this is important
      const video = document.createElement("video");
      video.setAttribute("src", file);
      video.setAttribute("crossorigin", "anonymous");
      video.load();
      video.currentTime = 1;
      video.onloadeddata = () => {
        let ctx: any = canvas.getContext("2d");

        canvas.width = 500;
        canvas.height = 500;

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        video.pause();
        return resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  useEffect(() => {
    if (Data.__typename != "SimpleProduct") {
      let newActiveFilter: any = [];
      Object.keys(selectedOptions).forEach(function (key, idx, arr) {
        if (selectedOptions[key]) {
          newActiveFilter.push(
            key + "--" + standardizeValue(selectedOptions[key])
          );
        }
      });
      setActiveFilters(newActiveFilter);
    }
  }, [selectedOptions]);

  const handleOptionSelect = async (option: any, value: any) => {
    let attributeCode = option.attribute_code;
    let optvalue = value.label;
    let tag = attributeCode + "--" + standardizeValue(optvalue);

    if (
      option.attribute_code == "dial_color" ||
      option.attribute_code == "metal_type"
    ) {
      setSelectedOptions([]);
      setSelectedOptions((prevOptions: any) => ({
        ...prevOptions,
        [attributeCode]: optvalue,
      }));

      Data?.configurable_options.forEach((opt: any) => {
        if (opt.attribute_code != attributeCode && opt.values.length == 1) {
          setSelectedOptions((prevOptions: any) => ({
            ...prevOptions,
            [opt.attribute_code]: opt.values[0].label,
          }));
        }
      });
    } else {
      if (!disabledOptions.includes(tag)) {
        setSelectedOptions((prevOptions: any) => ({
          ...prevOptions,
          [attributeCode]: optvalue,
        }));
      }
    }
  };

  const fetchFormKey = async () => {
    try {
      const response = await fetch(
        `${process.env.baseURL}fcprofile/sync/index`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching form key: ${response.statusText}`);
      }
      const data = await response.json();
      if (data) {
        setCookie("form_key", data.form_key, 1); // Set form_key in cookies
        return data.form_key; // Return form key after setting it
      } else {
        throw new Error("Form key not found in the response.");
      }
    } catch (error) {
      return null;
    }
  };

  const handleAddToCart = async (redirect: any) => {
    let errorCount = 0;
    if (Data.__typename != "SimpleProduct") {
      Object.keys(selectedOptions).forEach(function (key) {
        if (selectedOptions[key]) {
        } else {
          errorCount++;
        }
      });
    }
    if (errorCount > 0) {
      return;
    } else {
      let formKey = getCookie("form_key");

      // If form_key doesn't exist, fetch it first
      if (!formKey) {
        formKey = await fetchFormKey();
        if (!formKey) {
          return; // Stop execution if form key fetching fails
        }
      }
      setAddToLoading(true);
      const product = Data?.id;
      const superAttributes = Object.keys(SelectedOptionsID).map((key) => ({
        id: key,
        value: SelectedOptionsID[key],
      }));

      try {
        const response = await fetch(
          `${process.env.baseURL}fcprofile/cart/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product: product,
              qty: quantity,
              form_key: formKey, // Use the form_key from cookies or the fetched one
              options: [],
              super_attributes: superAttributes,
            }),
          }
        );

        const result = await response.json();

        if (result.success) {
          localStorage.setItem("cartCount", result.profile.cart_qty);
          localStorage.setItem("showcartBag", "true");
          window.dispatchEvent(new Event("storage"));
          setAddToLoading(false);
          if (redirect) {
            window.location.href = process.env.baseURL + "checkout/";
          }
        } else {
          setMoadalHeading("Oops!");
          setmMadalMessage(
            result.errors.general_exception
              ? result.errors.general_exception[0]?.message
              : result.message
                ? result.message
                : "Something went wrong... Please try again later."
          );
          setAddToLoading(false);
          setShowMoadal(true);
        }
      } catch (error: any) {
        setAddToLoading(false);
        setShowMoadal(true);
        setMoadalHeading("Oops!");
        setmMadalMessage("Error adding to cart: " + error.message);
      }
      // await fetchStockData();
    }
  };

  function formatPrice(value: number): string {
    // Format the value with locale-specific formatting and fixed to 2 decimals
    return value?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  function finalPrice() {
    const isConfigurable = Data.__typename === "ConfigurableProduct";
    const final_price = isConfigurable
      ? currentVariant?.priceRange?.maximum_price?.final_price?.value
      : Data?.priceRange?.maximum_price?.final_price?.value;
    let currency: any = Data?.price?.regularPrice?.amount?.currency;
    return `${Currency[currency]}${formatPrice(final_price)}`;
  }

  function regularPrice() {
    const isConfigurable = Data.__typename === "ConfigurableProduct";
    const final_price = isConfigurable
      ? currentVariant?.priceRange?.maximum_price?.final_price?.value
      : Data?.priceRange?.maximum_price?.final_price?.value;
    const regular_price = isConfigurable
      ? currentVariant?.priceRange?.maximum_price?.regular_price?.value
      : Data?.priceRange?.maximum_price?.regular_price?.value;
    let currency: any = Data?.price?.regularPrice?.amount?.currency;
    if (regular_price != final_price) {
      return `${Currency[currency]}${formatPrice(regular_price)}`;
    } else {
      return "";
    }
  }
  function savingPrice() {
    let final_price =
      currentVariant?.priceRange?.maximum_price?.final_price?.value ||
      Data?.priceRange?.maximum_price?.final_price?.value;

    let regular_price =
      currentVariant?.priceRange?.maximum_price?.regular_price?.value ||
      Data?.priceRange?.maximum_price?.regular_price?.value;

    // Calculate savings
    if (regular_price) {
      let saving = regular_price - final_price;
      if (saving > 0) {
        return `You will save $${formatPrice(saving)}`;
      }
    }

    return "";
  }

  const incrementQuantity = () => {
    setQuantity((prevQuantity: number) => Math.min(prevQuantity + 1, 100));
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity: number) => Math.max(prevQuantity - 1, 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(100, Number(e.target.value)));
    setQuantity(value);
  };

  if (!Data) {
    return <PDPSkeletonLoader />;
  }
  const calculateOverallRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0;

    const totalAverageRating = reviews.reduce(
      (total, review) => total + review.average_rating,
      0
    );

    // Calculate the average rating out of 100 and map to a 5-star scale
    return totalAverageRating / reviews.length / 20;
  };
  const reviews = Data.reviews?.items || [];
  const overallRating = calculateOverallRating(reviews);

  // =======================Find Lead Time===========================

  // Find the "lead_time" attribute
  const leadTimeAttribute = aggregations.find(
    (attr: any) => attr?.attribute_code === "lead_time"
  );

  // Find the option with count === 1
  const leadTimeOption = leadTimeAttribute?.options.find(
    (option: any) => option?.count === 1
  );

  return (
    <>
      <div className={styles.navBarSpace}></div>
      {showMoadal && (
        <div className="modal_outer">
          <div className="modal_contenct">
            <div className="close_icon" onClick={() => setShowMoadal(false)}>
              <Image
                width={35}
                height={35}
                src={"/Images/cross-23-32.png"}
                alt="Close Modal"
              />
            </div>
            <div className="modal_heading">{moadalHeading}</div>
            <div className="modal_message">{moadalMessage}</div>
          </div>
        </div>
      )}

      <div className={styles.detailContainer}>
        {/* <nav className={styles.breadcrumb}>
        {breadcrumbs.length === 0 && (
          <Link href={'/'} style={{  borderRight: 'black 1px solid', padding: '0 10px 0px 0px'}}>Home</Link>
        )}
        {breadcrumbs.map((crumb: any, index: number) => (
          <React.Fragment key={index}>
             <Link href={crumb.path}>
              <span>{crumb.name}</span>
            </Link>
          </React.Fragment>
        ))}
           <span style={{ borderRight: 'unset' }}>{displayName}</span>
      </nav> */}
        <div className={styles.cartegoryHeadeBreadcrumbs}>
          {/* Render Home link if no breadcrumbs are available */}
          {breadcrumbs && (
            <>
              <Link href="/" style={{}}>
                Home
              </Link>
              <span>/</span>
              <Link
                href={`${Data?.categories?.[0]?.name === "brands" && Data?.categories?.[0]?.url_key
                    ? Data?.categories?.[0]?.url_key
                    : Data?.categories?.[1]?.url_key || ""
                  }.html`}
              >

                {
                  Data?.categories?.[0]?.name === "brands" &&
                    Data?.categories?.[0]?.name
                    ? Data?.categories?.[0]?.name
                    : Data?.categories?.[0]?.name || ""}
              </Link>

              <span>/</span>
              <span className={styles.ProductDisplayName}>{displayName}</span>
            </>
          )}

          {/* Map through breadcrumbs */}
          {/* {breadcrumbs.map((crumb: any, index: number) => (
            <React.Fragment key={index}>
              <Link href={crumb.path}>{crumb.name.replace(".html", "").length > 60
  ? crumb.name.replace(".html", "").slice(0, 57) + "..."
  : crumb.name.replace(".html", "")}
</Link>

              {index < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))} */}

          {/* Display the last breadcrumb as a styled span */}
          {/* <span>{displayName}</span> */}
        </div>

        <div className={styles.productDetail}>
          {/* Brand, Review and Product Name Repeat For Mobile View */}
          <div className={styles.mobileBlock}>
            <div className={`${styles.brandReviewWrapper}`}>
              <p className={styles.brand}>{manufacturer.find(c => c.value === String(Data?.manufacturer))?.["data-title"] || ""}</p>
              {reviews.length > 0 && (
                <div className={styles.Breakdown}>
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const starValue = overallRating - idx;
                    if (starValue >= 1) {
                      return (
                        <Image
                          key={idx}
                          src="/Images/Filled.png"
                          alt="Full Star"
                          height={12}
                          width={12}
                        />
                      );
                    } else if (starValue >= 0.5) {
                      return (
                        <Image
                          key={idx}
                          src="/Images/Half filled.png"
                          alt="Half Star"
                          height={12}
                          width={12}
                        />
                      );
                    } else {
                      return (
                        <Image
                          key={idx}
                          src="/Images/Unfilled.png"
                          alt="Empty Star"
                          height={12}
                          width={12}
                        />
                      );
                    }
                  })}


                </div>
              )}
            </div>
          </div>
          <div className={`${styles.priceTitleWrapper} ${styles.mobileBlock}`}>
            <div className={`${styles.subTitelWrapper}`}>
              <h1 className={styles.mobileViewProductTitle}>
                {Data.__typename === "ConfigurableProduct"
                  ? currentVariant?.variant_name || Data?.name
                  : Data?.name}
              </h1>
            </div>
          </div>

          <div className={styles.productImages}>
            <GallerySection
              currentVariantData={currentVariant ? currentVariant : Data}
            />
          </div>

          <div className={styles.productInfo}>
            <div className={styles.desktopBlock}>
              {/* <div className={`${styles.brandReviewWrapper}`}>
                <p className={styles.brand}>{brandname}</p>
                {reviews.length > 0 && (
                  <div className={styles.Breakdown}>

                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starValue = overallRating - idx;
                      if (starValue >= 1) {
                        return (
                          <Image
                            key={idx}
                            src="/Images/Filled.png"
                            alt="Full Star"
                            height={12}
                            width={12}
                          />
                        );
                      } else if (starValue >= 0.5) {
                        return (
                          <Image
                            key={idx}
                            src="/Images/Half filled.png"
                            alt="Half Star"
                            height={12}
                            width={12}
                          />
                        );
                      } else {
                        return (
                          <Image
                            key={idx}
                            src="/Images/Unfilled.png"
                            alt="Empty Star"
                            height={12}
                            width={12}
                          />
                        );
                      }
                    })}


                  </div>
                )}
              </div> */}
            </div>
            <div
              className={`${styles.priceTitleWrapper} ${styles.desktopBlock}`}
            >
              <div className={styles.subTitelWrapper}>
                <h1>
                  {Data.__typename === "ConfigurableProduct"
                    ? currentVariant?.variant_name || Data?.name
                    : Data?.name}
                </h1>
              </div>
              <p className={styles.paymentInfo}>
                <b>SKU:</b> {currentVariant ? currentVariant.sku : Data?.sku}
                {isMounted && (
                  <span className={styles.tooltipWrapper}>
                    <span className={styles.tooltipIcon}>?</span>
                    <div className={styles.tooltipContainer}>
                      <div className={styles.tooltipContent}>
                        <div className={styles.tooltipTitle}>OUR PRICING PROMISE</div>
                        <div className={styles.tooltipText}>
                          We're committed to offering the most transparent and fair pricing to you. We determine market
                          pricing based on the type of item it is, brand, and model and measure that against all closest
                          competitors.
                        </div>
                        <div className={styles.tooltipTitle}>CONTACT OUR CONCIERGE</div>
                        <div className={styles.tooltipText}>support@Headora.com or 1-800-690-3736.</div>
                      </div>
                    </div>
                  </span>
                )}
              </p>
              <p className={styles.price}>
                <span className={styles.special}>{finalPrice()}</span>
                <span className={styles.regular}>{regularPrice()}</span>
                <p className={styles.AnticipatedDeliveryText}>Anticipated Delivery: {leadTimeOption?.label || "3 - 4 Week"} </p>
              </p>
            </div>

            {Data?.__typename === "ConfigurableProduct" && (
              <div
                className={styles.ConfigurableWrapper + " ConfigurableProduct"}
              >
                {Data?.configurable_options?.map((option: any) => (
                  <>
                    <AttributeSlider
                      option={option}
                      handleOptionSelect={handleOptionSelect}
                      disabledOptions={disabledOptions}
                      activeFilters={activeFilters}
                    />
                  </>
                ))}
              </div>
            )}

            {/* Affirm and Product Price Repeat For Mobile View */}

            {affirmShow && affirmPrice != undefined && (
              <div
                id="affirmfinance"
                className={`affirm-as-low-as ${styles.mobileBlock}`}
                data-page-type="product"
                data-amount={affirmPrice}
              />
            )}
            <div className={styles.mobileBlock}>
              <p className={`${styles.price} `}>
                <span className={styles.special}>{finalPrice()}</span>
                <span className={styles.regular}>{regularPrice()}</span>
                {savingPrice() && (
                  <span className={styles.mobilePriceDiscount}>
                    {savingPrice()}
                  </span>
                )}
              </p>
              <p className={styles.AnticipatedDeliveryText}>Anticipated Delivery: {leadTimeOption?.label || "3 - 4 Week"} </p>
            </div>

            <div className={styles.quantityActionWrapper}>
              {/* Quantity Selector */}
              {stockStatus === "OUT_OF_STOCK" ? (
                ""
              ) : (
                <div className={styles.quantitySelector}>
                  <label htmlFor="quantity">Quantity: </label>
                  <div className={styles.customQuantity}>
                    <button
                      className={styles.decrementButton}
                      onClick={decrementQuantity}
                      disabled={
                        stockStatus === "OUT_OF_STOCK" || loadingStockStatus
                      }
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={
                        stockStatus === "OUT_OF_STOCK" || loadingStockStatus
                          ? "0"
                          : quantity
                      }
                      onChange={handleQuantityChange}
                      min="1"
                      max="100"
                      className={styles.quantityInput}
                      disabled={
                        stockStatus === "OUT_OF_STOCK" || loadingStockStatus
                      }
                    />
                    <button
                      className={styles.incrementButton}
                      onClick={incrementQuantity}
                      disabled={
                        stockStatus === "OUT_OF_STOCK" || loadingStockStatus
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actionButtonsWrapper}>
                {loadingStockStatus ? (
                  <div className={styles.actionButtons}>
                    <span className={styles.loadingButton}>
                      Please wait...
                    </span>
                  </div>
                ) : stockStatus === "OUT_OF_STOCK" ? (
                  <div className={styles.actionButtons}>
                    <span className={styles.outOfStockText}>Out of Stock</span>
                  </div>
                ) : addToLoading ? (
                  <div className={styles.actionButtons}>
                    <span className={styles.loadingButton}>
                      Please wait...
                    </span>
                  </div>
                ) : (
                  <div className={styles.inlineActions}>
                    <button
                      className={styles.shopNow}
                      onClick={() => handleAddToCart(false)}
                    >
                      Add To Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Offer Component */}
              {stockStatus !== "OUT_OF_STOCK" && !loadingStockStatus && (
                <MakeAOffer
                  productID={Data?.id}
                  sku={currentVariant ? currentVariant.sku : Data?.sku}
                  productName={
                    Data.__typename === "ConfigurableProduct"
                      ? currentVariant?.variant_name || Data?.name
                      : Data?.name
                  }
                  price={
                    regularPrice()?.length == 0 ? finalPrice() : regularPrice()
                  }
                  specialPrice={
                    regularPrice()?.length == 0 ? "$0" : finalPrice()
                  }
                />
              )}
              {/* <button
                    className={styles.buyNow}
                    onClick={() => handleAddToCart(false)}
                  >
                    Buy It Now
                  </button> */}
            </div>



            <ul className={styles.productFeatures}>
              <li>
                <Image
                  height={50}
                  width={50}
                  src="/Images/ShippingLogo.png"
                  alt="ShippingLogo"
                />
                <p>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open(
                        `${process.env.baseURLWithoutTrailingSlash}/shipping`,
                        "_blank"
                      );
                    }}
                  >
                    Shipping
                  </span>{" "}
                  and{" "}
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open(
                        `${process.env.baseURLWithoutTrailingSlash}/returns`,
                        "_blank"
                      );
                    }}
                  >
                    Returns
                  </span>
                </p>
              </li>
              <li>
                <Image
                  height={50}
                  width={50}
                  src="/Images/PersonLogo.png"
                  alt="PersonLogo"
                />
                <p>
                  Speak to an expert{" "}
                  <Link href="tel:+1 888 635 6174"> +1 (800) 690-3736</Link>
                </p>
              </li>
              <li>
                <Image
                  height={50}
                  width={50}
                  src="/Images/ruler.png"
                  alt="Ruler"
                />
                <Link href={`${process.env.baseURL}Watch Size Guides.pdf`} target="_blank">
                  <p>See Watch size guide</p>
                </Link>
              </li>
              {/*  <li>
                <Image
                  height={50}
                  width={50}
                  src="/Images/gift.png"
                  alt="ShippingLogo"
                  style={{ width: "18px", height: "16px" }}
                />
                <p>
                  {" "}
                  Anticipated Delivery: {leadTimeOption?.label || "3 - 4 Week"}
                </p>
              </li> */}
            </ul>
            {/* <div className={styles.WishListIconWrraper}>
                            {wishlistLoading[Data.id] || wishlistItemsLoading ? (
                              <div className={styles.SearchLoader}></div>
                            ) : wishlistItems[Data.id] ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleRemoveWishlist(wishlistItemIds[Data.id])
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                              >
                                <Image
                                  src="/Images/wishlistIconFill.png"
                                  height={24}
                                  width={27}
                                  alt="wishlist filled icon"
                                />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleWishlist(Data.sku, Data.id)
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                              >
                                <Image src="/Images/wishlistIcon.png" height={24} width={27} alt="wishlist icon" />
                              </button>
                            )}
                          </div> */}
            {/* <div className={styles.wishlist_container}>

              <Link href={'/customer/account/login/'} style={{ display: 'flex', gap: '10px' }}>
                <Image src={'/Images/wishlistIcon.png'} height={24} width={27} alt="wishlist icon" />
                <Image src={'/Images/wishlistIconFill.png'} height={24} width={27} alt="wishlist icon"/>
                <p className={styles.wishlist}>Wishlist</p>
              </Link>
            </div> */}
            <ShortDescriptionNavBars
              currentVariant={currentVariant ? currentVariant : Data}
              configurableOptions={Data?.configurable_options}
              Data={Data}
              aggregations={aggregations}
              ReturnDataCMSBlock={ReturnDataCMSBlock}
            />
            <div className={styles.SharedSocialMediaIcons}>
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generateProductUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
              >
                <div className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
              </Link>
              <Link
                href={`https://x.com/intent/post?url=${encodeURIComponent(generateProductUrl())}&text=${encodeURIComponent(getProductName())}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Twitter/X"
              >
                <div className={styles.socialIcon}>
                  <Image src={'/Images/x.png'} height={16} width={16} alt={"x icon"} />
                </div>
              </Link>
              <Link
                href={`https://in.pinterest.com/pin-builder/?description=${encodeURIComponent(getProductName())}&media=${encodeURIComponent(getProductImageUrl() || "")}&url=${encodeURIComponent(generateProductUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Pinterest"
              >
                <div className={styles.socialIcon}>
                  <Image src={'/Images/pinterest-icon.png'} height={20} width={20} alt={"p icon"} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div id="reviewssection"></div>
    </>
  );
}

export default ProductDetail;
