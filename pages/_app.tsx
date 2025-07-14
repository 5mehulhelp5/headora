import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Layout from "@/components/Layout/layout";
import "@/styles/globals.css";
import { NextPageContext } from "next";
import { Client } from "@/graphql/client";
import Ribbon from "@/components/Ribbon/Ribbon";
import { useEffect, useState } from "react";
import MobileHeader from "@/components/Header/MobileHeader";
import TopRibbon from "@/components/TopRibbon/TopRibbon";
import { AuthProvider } from "../context/auth-context";

let cachedData: any = null; 
function App({ categoriesList, Component, pageProps, ribbonResponce,
    BoutiqueCategoriesList
  }: any) {
   
  const [showRibbon, setShowRibbon] = useState<any>(false);
  const [isMobile, setIsMobile] = useState<any>(false);



  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        // Skip on localhost to avoid CORS error
        if (typeof window !== "undefined" && window.location.hostname === "localhost") {
          console.log("Skipping user sync on localhost");
          return;
        }
  
        const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) throw new Error("Network response was not ok");
  
        const user = await response.json();
        sessionStorage.setItem("userSyncData", JSON.stringify(user));
      } catch (error) {
        console.error("Error checking user login status:", error);
      }
    };
  
    checkUserLogin();
  }, []);
  
  
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowRibbon(window.scrollY === 0); // Hide Ribbon if the user has scrolled
    };

    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(() => {
      setShowRibbon(true);
    }, 1000);
    return () => {
      window.removeEventListener("scroll", handleScroll); // Cleanup on unmount
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
<AuthProvider>
      <Layout>
      {showRibbon && <TopRibbon ribbonResponce={ribbonResponce}/>}
        
      {showRibbon && <Ribbon isMobile={isMobile}/>}
     
              <MobileHeader
              categoriesList={categoriesList}
              BoutiqueCategoriesList={BoutiqueCategoriesList}
            />
      
          <Header categoriesList={ categoriesList} 
           BoutiqueCategoriesList={ BoutiqueCategoriesList} 
           />
      
        <Component isMobile={isMobile} categoriesList={categoriesList} showRibbon={showRibbon} {...pageProps} />
        <Footer/>
      </Layout>
      </AuthProvider>
    </>
  )
}
App.getInitialProps = async (ctx: NextPageContext) => {
 
  if (!cachedData) {
    const client = new Client();
    const response = await client.fetchCategories();
    const ribbonResponce = await client.fetchTopRibbion();
     const Boutiqueresponse = await client.fetchBoutiqueCategories();
    cachedData = { categoriesList: response, 
         BoutiqueCategoriesList: Boutiqueresponse,
       ribbonResponce };
  } 
  return cachedData;

}
export default App