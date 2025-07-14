import { Client } from "@/graphql/client";
import Head from "next/head";

function PrivacyPolicy({CMSPageData}:any){
    const sanitizedHtml = CMSPageData?.data?.cmsPage?.content;
    return(
        <>
            <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Truefacet"}</title>
        <meta
          name="description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "This Privacy Policy sets forth TrueFacet's policy with respect to personally identifiable information and other information that is collected from Site visitors and Registered Users. "}
        />
        <meta name="keywords" content={CMSPageData?.meta_keywords ? CMSPageData?.meta_keywords : "Privacy Policy | Truefacet"}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}privacy-policy/`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Truefacet"} />
        <meta
          property="og:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "This Privacy Policy sets forth TrueFacet's policy with respect to personally identifiable information and other information that is collected from Site visitors and Registered Users. "}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}privacy-policy/`}
        />
        <meta property="og:site_name" content="TrueFacet" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/PrivacyPolicyOGImage.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/PrivacyPolicyOGImage.png`}
        />
        <meta property="og:image:width" content="1133" />
        <meta property="og:image:height" content="710" />
        <meta
          property="og:image:alt"
          content={CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Truefacet"}
        />
        <meta property="og:image:type" content="image/jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Truefacet"} />
        <meta
          name="twitter:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "This Privacy Policy sets forth TrueFacet's policy with respect to personally identifiable information and other information that is collected from Site visitors and Registered Users. "}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/PrivacyPolicyOGImage.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

        </>
    )
}
export default PrivacyPolicy

export async function getStaticProps() {
  const client = new Client();
  let CMSPageData = null;


  try {
    CMSPageData = await client.fetchPrivacyPolicyCMSPages();

  } catch (error) {

  }


  return {
    props: {
      CMSPageData,
   
    },

  };
}
