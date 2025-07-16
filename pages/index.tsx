import Head from "next/head";
import { Client } from "@/graphql/client";
import { useEffect, useRef, useState } from "react";

export default function Home({ CMSPageData, BouitqueCMSPages, showRibbon }: any) {

  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Function to transform product URLs and truncate product names
  const transformProductUrls = (htmlContent: string): string => {
    if (!htmlContent) return htmlContent

    // Regular expression to find URLs within product-item-info divs
    const urlPattern = /href="https:\/\/www\.Headoranft\.com\/[^"]*"/g

    return htmlContent.replace(urlPattern, (match) => {
      // Extract the URL from the href attribute
      const url = match.replace(/href="([^"]*)"/, "$1")

      // Skip if it's not a product URL or already in correct format
      if (!url.includes("/default/") && !url.includes("/catalog/product/view/")) {
        return match
      }

      let transformedUrl = ""

      // Handle URLs like: /default/cross-pendant-p000905014w.html
      if (url.includes("/default/") && !url.includes("/catalog/product/view/")) {
        const parts = url.split("/default/")
        if (parts.length === 2) {
          const slug = parts[1]
          transformedUrl = `https://www.Headoranft.com/${slug}`
        }
      }
      // Handle URLs like: /default/catalog/product/view/id/4076078/s/pre-owned-rolex-daytona-116523-steel-yellow-gold-watch/
      else if (url.includes("/catalog/product/view/id/") && url.includes("/s/")) {
        const slugMatch = url.match(/\/s\/([^/]+)\/?$/)
        if (slugMatch && slugMatch[1]) {
          let slug = slugMatch[1]
          // Ensure it ends with .html
          if (!slug.endsWith(".html")) {
            slug += ".html"
          }
          transformedUrl = `https://www.Headoranft.com/${slug}`
        }
      }

      // If transformation was successful, return the new href
      if (transformedUrl) {
        return `href="${transformedUrl}"`
      }

      // Return original if transformation failed
      return match
    })
  }

  // Apply URL transformation to the sanitized HTML
  const sanitizedHtml = CMSPageData?.data?.cmsPage?.content?.replace(/\/cache\/[a-f0-9]+\/+/g, "/")

  // Transform the URLs in the HTML content
  const transformedHtml = transformProductUrls(sanitizedHtml)



  // ================== For Product Items Auto Slider =========================
  useEffect(() => {
    const container = sliderRef.current
    if (!container) return

    setTimeout(() => {
      const productGrid = container.querySelector(
        ".hero_section_slide_right_container .product-items.widget-product-grid",
      ) as HTMLElement
      if (!productGrid) {
        console.log("No product grid found")
        return
      }

      let scrollPosition = 0
      const itemWidth = window.innerWidth < 768 ? 260 : 310// Width to scroll each time
      const scrollInterval = 3000 // 3 seconds

      // Get the total scrollable width
      const getMaxScroll = () => {
        return productGrid.scrollWidth - productGrid.clientWidth
      }

      // Auto scroll function
      const autoScroll = () => {
        // If we've reached the end, reset to beginning
        if (scrollPosition >= getMaxScroll()) {
          scrollPosition = 0
          productGrid.scrollTo({ left: 0, behavior: "auto" })
        } else {
          // Otherwise, scroll to the next position
          scrollPosition += itemWidth
          productGrid.scrollTo({ left: scrollPosition, behavior: "smooth" })
        }
      }

      // Start auto scrolling
      let intervalId = setInterval(autoScroll, scrollInterval)

      // Pause auto scrolling when user interacts with the slider
      const pauseAutoScroll = () => {
        clearInterval(intervalId)
      }

      const resumeAutoScroll = () => {
        // Update the current scroll position before resuming
        scrollPosition = productGrid.scrollLeft
        clearInterval(intervalId)
        setTimeout(() => {
          const newIntervalId = setInterval(autoScroll, scrollInterval)
          // Update the intervalId reference
          intervalId = newIntervalId
        }, 2000) // Resume after 2 seconds of inactivity
      }

      // Add event listeners for user interaction
      productGrid.addEventListener("mousedown", pauseAutoScroll)
      productGrid.addEventListener("touchstart", pauseAutoScroll)
      productGrid.addEventListener("mouseup", resumeAutoScroll)
      productGrid.addEventListener("touchend", resumeAutoScroll)

      // Clean up on component unmount
      return () => {
        clearInterval(intervalId)
        productGrid.removeEventListener("mousedown", pauseAutoScroll)
        productGrid.removeEventListener("touchstart", pauseAutoScroll)
        productGrid.removeEventListener("mouseup", resumeAutoScroll)
        productGrid.removeEventListener("touchend", resumeAutoScroll)
      }
    }, 2000) // Wait for 2 seconds for the DOM to be fully loaded
  }, [transformedHtml, showRibbon])


  // ========================For Testimonial Section Slider==================== 
  useEffect(() => {
    const sliderContainer = sliderRef.current;
    if (!sliderContainer) return;
    setTimeout(() => {
      const testimonials = sliderContainer.querySelectorAll(".testimonial-change");
      const nextBtn = sliderContainer.querySelector(".nav-next");
      const prevBtn = sliderContainer.querySelector(".nav-prev");

      let currentIndex = 0;

      const showSlide = (index: number) => {
        testimonials.forEach((testimonial, i) => {
          if (i === index) {
            (testimonial as HTMLElement).style.display = "block";
          } else {
            (testimonial as HTMLElement).style.display = "none";
          }
        });
      };

      // Initialize first slide
      showSlide(currentIndex);

      const handleNext = () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showSlide(currentIndex);
      };

      const handlePrev = () => {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        showSlide(currentIndex);
      };

      nextBtn?.addEventListener("click", handleNext);
      prevBtn?.addEventListener("click", handlePrev);

      // Cleanup on unmount
      return () => {
        nextBtn?.removeEventListener("click", handleNext);
        prevBtn?.removeEventListener("click", handlePrev);
      };
    }, 1000)
  }, [transformedHtml, showRibbon]);



  // ===========================For the Trending Section Tab Change================= 
  useEffect(() => {
    const sliderContainer = sliderRef.current;

    setTimeout(() => {
      if (!sliderContainer) return;

      const LatestSelector = sliderContainer.querySelector("#Latest-selector");
      const WatchesSelector = sliderContainer.querySelector("#Watches-selector");
      const JewelrySelector = sliderContainer.querySelector("#jewelry-selector");
      const HandBagsSelector = sliderContainer.querySelector("#handbag-selector");

      const TrendingSectionLatest: any = sliderContainer.querySelector(".trending-section-latest");
      const TrendingSectionWatches: any = sliderContainer.querySelector(".trending-section-watches");
      const TrendingSectionJewelry: any = sliderContainer.querySelector(".trending-section-jewelry");
      const TrendingSectionHandbags: any = sliderContainer.querySelector(".trending-section-handbag");

      // Helper to remove active tab class
      const removeActiveTabClass = () => {
        LatestSelector?.classList.remove("tab-active");
        WatchesSelector?.classList.remove("tab-active");
        JewelrySelector?.classList.remove("tab-active");
        HandBagsSelector?.classList.remove("tab-active");
      };

      // ✅ Set default active tab (Latest)
      removeActiveTabClass();
      LatestSelector?.classList.add("tab-active");

      if (LatestSelector) {
        LatestSelector.addEventListener("click", () => {
          TrendingSectionLatest.classList.add("trending-section-active");
          TrendingSectionLatest.classList.remove("trending-section-latest-unactive");
          TrendingSectionWatches.classList.remove("trending-section-active");
          TrendingSectionJewelry.classList.remove("trending-section-active");


          removeActiveTabClass();
          LatestSelector.classList.add("tab-active");
        });
      }

      if (WatchesSelector) {
        WatchesSelector.addEventListener("click", () => {
          TrendingSectionLatest.classList.remove("trending-section-active");
          TrendingSectionLatest.classList.add("trending-section-latest-unactive");
          TrendingSectionWatches.classList.add("trending-section-active");
          TrendingSectionJewelry.classList.remove("trending-section-active");


          removeActiveTabClass();
          WatchesSelector.classList.add("tab-active");
        });
      }

      if (JewelrySelector) {
        JewelrySelector.addEventListener("click", () => {
          TrendingSectionLatest.classList.remove("trending-section-active");
          TrendingSectionLatest.classList.add("trending-section-latest-unactive");
          TrendingSectionWatches.classList.remove("trending-section-active");
          TrendingSectionJewelry.classList.add("trending-section-active");


          removeActiveTabClass();
          JewelrySelector.classList.add("tab-active");
        });
      }

      if (HandBagsSelector) {
        HandBagsSelector.addEventListener("click", () => {
          TrendingSectionLatest.classList.remove("trending-section-active");
          TrendingSectionLatest.classList.add("trending-section-latest-unactive");
          TrendingSectionWatches.classList.remove("trending-section-active");
          TrendingSectionJewelry.classList.remove("trending-section-active");
          TrendingSectionHandbags.classList.add("trending-section-active");

          removeActiveTabClass();
          HandBagsSelector.classList.add("tab-active");
        });
      }
    }, 1000);
  }, [transformedHtml, showRibbon]);




  // ===========================For Trending Section Slider=================
  useEffect(() => {
    const container = sliderRef.current
    if (!container) return

    setTimeout(() => {
      // Get all trending sections
      const trendingSections = [
        container.querySelector(".trending-section-latest"),
        container.querySelector(".trending-section-watches"),
        container.querySelector(".trending-section-jewelry"),
        container.querySelector(".trending-section-handbag"),
      ]

      trendingSections.forEach((section) => {
        if (!section) return

        // Find the product grid in this section
        const productGrid = section.querySelector(".product-items.widget-product-grid") as HTMLElement
        if (!productGrid) return

        // Check if buttons already exist to avoid duplicates
        if (section.querySelector(".trending-prev") || section.querySelector(".trending-next")) {
          return
        }

        // Create wrapper for the section if not already wrapped
        const sectionWrapper = document.createElement("div")
        sectionWrapper.style.position = "relative"
        sectionWrapper.classList.add("trending-slider-wrapper")

        // Create prev button
        const prevButton = document.createElement("button")
        prevButton.innerHTML = "&#10094;" // Left arrow
        prevButton.className = "trending-prev"
        prevButton.style.position = "absolute"
        prevButton.style.left = "0"
        prevButton.style.top = "50%"
        prevButton.style.transform = "translateY(-50%)"
        prevButton.style.zIndex = "10"
        prevButton.style.background = "#fff"
        prevButton.style.border = "1px solid #ddd"
        prevButton.style.borderRadius = "50%"
        prevButton.style.width = "40px"
        prevButton.style.height = "40px"
        prevButton.style.cursor = "pointer"
        prevButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)"

        // Create next button
        const nextButton = document.createElement("button")
        nextButton.innerHTML = "&#10095;" // Right arrow
        nextButton.className = "trending-next"
        nextButton.style.position = "absolute"
        nextButton.style.right = "0"
        nextButton.style.top = "50%"
        nextButton.style.transform = "translateY(-50%)"
        nextButton.style.zIndex = "10"
        nextButton.style.background = "#fff"
        nextButton.style.border = "1px solid #ddd"
        nextButton.style.borderRadius = "50%"
        nextButton.style.width = "40px"
        nextButton.style.height = "40px"
        nextButton.style.cursor = "pointer"
        nextButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)"

        // Wrap the product grid
        const gridParent = productGrid.parentElement
        if (gridParent) {
          // Create a container for the product grid
          const gridContainer = document.createElement("div")
          gridContainer.style.position = "relative"
          gridContainer.style.overflow = "hidden"
          gridContainer.style.width = "100%"

          // Insert the wrapper before the product grid
          gridParent.insertBefore(gridContainer, productGrid)

          // Move the product grid inside the container
          gridContainer.appendChild(productGrid)

          // Add buttons to the container
          gridContainer.appendChild(prevButton)
          gridContainer.appendChild(nextButton)
        }

        // Scroll amount
        const scrollAmount = 300 // Slightly more than product width to account for gap

        // Scroll functions
        const scrollLeft = () => {
          productGrid.scrollBy({ left: -scrollAmount, behavior: "smooth" })
        }

        const scrollRight = () => {
          productGrid.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }

        // Add event listeners
        prevButton.addEventListener("click", scrollLeft)
        nextButton.addEventListener("click", scrollRight)

        // Update button visibility based on scroll position
        const updateButtonVisibility = () => {
          prevButton.style.opacity = productGrid.scrollLeft <= 0 ? "0.5" : "1"
          prevButton.style.cursor = productGrid.scrollLeft <= 0 ? "default" : "pointer"

          const maxScrollLeft = productGrid.scrollWidth - productGrid.clientWidth
          nextButton.style.opacity = productGrid.scrollLeft >= maxScrollLeft ? "0.5" : "1"
          nextButton.style.cursor = productGrid.scrollLeft >= maxScrollLeft ? "default" : "pointer"
        }

        // Initial button visibility
        updateButtonVisibility()

        // Update button visibility on scroll
        productGrid.addEventListener("scroll", updateButtonVisibility)

        // Cleanup
        return () => {
          prevButton.removeEventListener("click", scrollLeft)
          nextButton.removeEventListener("click", scrollRight)
          productGrid.removeEventListener("scroll", updateButtonVisibility)
        }
      })
    }, 1000)
  }, [transformedHtml, showRibbon])


  // ================== For Social Media Section Auto Slider =========================
  useEffect(() => {
    const container = sliderRef.current
    if (!container) return

    setTimeout(() => {
      const featuredCategory = container.querySelector(".featured_category") as HTMLElement
      if (!featuredCategory) {
        console.log("No .featured_category found")
        return
      }

      // Ensure parent of .featured_category is position: relative
      const wrapper = document.createElement("div")
      wrapper.style.position = "relative"

      // Move .featured_category inside wrapper if not already wrapped
      if (!featuredCategory.parentElement?.classList.contains("auto-slider-wrapper")) {
        featuredCategory.parentElement?.insertBefore(wrapper, featuredCategory)
        wrapper.appendChild(featuredCategory)
        wrapper.classList.add("auto-slider-wrapper")
      }

      // Scroll Amount and Interval
      const scrollAmount = 400
      const scrollInterval = 3000 // 3 seconds

      let scrollPosition = 0

      // Get the total scrollable width
      const getMaxScroll = () => {
        return featuredCategory.scrollWidth - featuredCategory.clientWidth
      }

      // Auto scroll function
      const autoScroll = () => {
        // If we've reached the end, reset to beginning
        if (scrollPosition >= getMaxScroll()) {
          scrollPosition = 0
          featuredCategory.scrollTo({ left: 0, behavior: "auto" })
        } else {
          // Otherwise, scroll to the next position
          scrollPosition += scrollAmount
          featuredCategory.scrollTo({ left: scrollPosition, behavior: "smooth" })
        }
      }

      // Start auto scrolling
      let intervalId = setInterval(autoScroll, scrollInterval)

      // Pause auto scrolling when user interacts with the slider
      const pauseAutoScroll = () => {
        clearInterval(intervalId)
      }

      const resumeAutoScroll = () => {
        // Update the current scroll position before resuming
        scrollPosition = featuredCategory.scrollLeft
        clearInterval(intervalId)
        setTimeout(() => {
          intervalId = setInterval(autoScroll, scrollInterval)
        }, 2000) // Resume after 2 seconds of inactivity
      }

      // Add event listeners for user interaction
      featuredCategory.addEventListener("mousedown", pauseAutoScroll)
      featuredCategory.addEventListener("touchstart", pauseAutoScroll)
      featuredCategory.addEventListener("mouseup", resumeAutoScroll)
      featuredCategory.addEventListener("touchend", resumeAutoScroll)

      // Clean up on component unmount
      return () => {
        clearInterval(intervalId)
        featuredCategory.removeEventListener("mousedown", pauseAutoScroll)
        featuredCategory.removeEventListener("touchstart", pauseAutoScroll)
        featuredCategory.removeEventListener("mouseup", resumeAutoScroll)
        featuredCategory.removeEventListener("touchend", resumeAutoScroll)
      }
    }, 2000)
  }, [transformedHtml, showRibbon])

  // ================== For Product Items Auto Slider =========================
  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    // Original product slider code (keep this part)
    setTimeout(() => {
      const productGrid = container.querySelector(
        ".hero_section_slide_right_container .product-items.widget-product-grid",
      ) as HTMLElement;
      if (!productGrid) {
        console.log("No product grid found");
        return;
      }

      // Your existing product slider code...
      // [Keep all the existing product slider logic]

    }, 2000);

    // ================== Popular Brands Slider =========================
    setTimeout(() => {
      // Get elements for the brands slider
      const brandsList = container.querySelector(".popular_brands_list") as HTMLElement;
      const prevBtn = container.querySelector(".popular_brands_prv_btn") as HTMLElement;
      const nextBtn = container.querySelector(".popular_brands_next_btn") as HTMLElement;
      const brandItems = container.querySelectorAll(".popular_brands_item");

      if (!brandsList || !prevBtn || !nextBtn || brandItems.length === 0) {
        console.log("Brand slider elements not found");
        return;
      }

      // Initialize variables
      let currentIndex = 0;
      const totalItems = brandItems.length;
      const itemWidth = 300; // Width of each brand item with padding
      let isDragging = false;
      let startPos = 0;
      let scrollLeft = 0;

      // Function to scroll to a specific item
      const scrollToItem = (index: number) => {
        // Ensure the index loops around
        if (index < 0) index = totalItems - 1;
        if (index >= totalItems) index = 0;

        currentIndex = index;
        brandsList.scrollTo({
          left: itemWidth * currentIndex,
          behavior: "smooth"
        });
      };

      // Next button click handler
      nextBtn.addEventListener("click", () => {
        scrollToItem(currentIndex + 1);
      });

      // Previous button click handler
      prevBtn.addEventListener("click", () => {
        scrollToItem(currentIndex - 1);
      });

      // Mouse/touch drag functionality
      brandsList.addEventListener("mousedown", (e) => {
        isDragging = true;
        startPos = e.pageX - brandsList.offsetLeft;
        scrollLeft = brandsList.scrollLeft;
        brandsList.style.cursor = "grabbing";
      });

      brandsList.addEventListener("mouseleave", () => {
        isDragging = false;
        brandsList.style.cursor = "grab";
      });

      brandsList.addEventListener("mouseup", () => {
        isDragging = false;
        brandsList.style.cursor = "grab";

        // Snap to closest item
        const itemIndex = Math.round(brandsList.scrollLeft / itemWidth);
        scrollToItem(itemIndex);
      });

      brandsList.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - brandsList.offsetLeft;
        const walk = (x - startPos) * 2; // Speed multiplier
        brandsList.scrollLeft = scrollLeft - walk;
      });

      // Touch events for mobile
      brandsList.addEventListener("touchstart", (e) => {
        isDragging = true;
        startPos = e.touches[0].pageX - brandsList.offsetLeft;
        scrollLeft = brandsList.scrollLeft;
      });

      brandsList.addEventListener("touchend", () => {
        isDragging = false;

        // Snap to closest item
        const itemIndex = Math.round(brandsList.scrollLeft / itemWidth);
        scrollToItem(itemIndex);
      });

      brandsList.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - brandsList.offsetLeft;
        const walk = (x - startPos) * 2;
        brandsList.scrollLeft = scrollLeft - walk;
      });

      // Add additional CSS to ensure proper scrolling behavior
      brandsList.style.scrollBehavior = "smooth";
      brandsList.style.scrollSnapType = "x mandatory";

      // Add scroll-snap-align to each item
      brandItems.forEach((item) => {
        (item as HTMLElement).style.scrollSnapAlign = "center";
        (item as HTMLElement).style.flexShrink = "0";
      });

      // Prevent scrolling issues
      brandsList.addEventListener("scroll", () => {
        // Check if we've reached the end and need to loop back
        if (brandsList.scrollLeft + brandsList.clientWidth >= brandsList.scrollWidth) {
          currentIndex = 0;
          setTimeout(() => {
            brandsList.scrollTo({ left: 0, behavior: "auto" });
          }, 500);
        }

        // Check if we've scrolled to the beginning and need to loop to the end
        if (brandsList.scrollLeft <= 0 && currentIndex === 0) {
          currentIndex = totalItems - 1;
        }
      });

    }, 2000); // Wait for DOM to be fully loaded
  }, [transformedHtml, showRibbon]);


  // ===========================Meta Tags==================================== 
  const heroImage = transformedHtml?.match(/background-image.*?url\(['"]?(.*?)['"]?\)/)?.[1] || ""
  const fileExtension = heroImage.split('.').pop()?.toLowerCase() || "jpg";
  const pageUrl = `${process.env.baseURLWithoutTrailingSlash}`
  const metaTitle = CMSPageData?.cmsPage?.meta_title || 'Headora';
  const metaDescription = CMSPageData?.cmsPage?.meta_description || 'The #1 marketplace for buying, selling and trading-in fine watches & jewelry. Save on Rolex, Tiffany & Co., Cartier, Omega & more from your favorite brands.';


  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Robots */}
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={pageUrl} />

        {/* Title and Canonical */}
        <title>{metaTitle}</title>


        {/* SEO Meta Tags */}
        <meta name="title" content={metaTitle} />
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={CMSPageData?.cmsPage?.meta_keywords || 'Headora'} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Headora" />

        {/* Open Graph Image */}
        <meta property="og:image" content={heroImage} />
        <meta property="og:image:secure_url" content={heroImage} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="900" />
        <meta property="og:image:type" content={`image/${fileExtension}`} />

        {/* Twitter Meta Tags */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={metaTitle} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={heroImage} />
      </Head>

      {/* ==============Schema=================  */}

      <OrganizationSchema />
      <HomePageSchema HeroBanner={heroImage} metaDescription={metaDescription} />
      {/* Entire Home Page Content is Coming from CMS (Here ↓)  */}

      <div ref={sliderRef}>
        <div dangerouslySetInnerHTML={{ __html: transformedHtml }} />
      </div>
    </>
  );
}

// ==============Schema Functions==============

const HomePageSchema = ({ HeroBanner, metaDescription }: any) => {

  return (

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Headora",
          "description": metaDescription,
          "image": HeroBanner,
          "mainEntity": {
            "@type": "WebPageElement",
            "name": "Hero Section",
            "description": metaDescription,
            "url": `${process.env.baseURLWithoutTrailingSlash}` // Set this to your call-to-action URL
          }
        }),
      }}
    />

  );
};

const OrganizationSchema = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Headora",
          "url": `${process.env.baseURLWithoutTrailingSlash}`,
          "logo": `${process.env.baseURLWithoutTrailingSlash}/Logo/Logo_transparent.png`,
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "telephone": "+1-800-690-3736",
              "contactType": "Customer Service",
              "areaServed": "Worldwide",
              "availableLanguage": ["English"],
            },
          ],
          "sameAs": [
            "https://www.facebook.com/profile.php?id=100088095545673&amp;mibextid=LQQJ4d&amp;rdid=GzonofqiS7wvqQ9V&amp;share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2FhijNeHjqKVeZ4eJM%2F%3Fmibextid%3DLQQJ4d",
            "http://instagram.com/Headora",
            "http://twitter.com/Headora",
            "http://www.pinterest.com/Headora"
          ],
        }),
      }}
    />
  );
};


export async function getStaticProps() {
  const client = new Client();
  let CMSPageData = null;

  try {
    CMSPageData = await client.fetchCMSPages();


  } catch (error) {
    console.error("Error fetching CMS data", error);
  }

  return {
    props: {
      CMSPageData,
    },
  };
}
