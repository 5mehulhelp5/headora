import { Client } from "@/graphql/client";
import Head from "next/head";

function WatchWarranty({ CMSPageData }: any) {
  const sanitizedHtml = CMSPageData?.data?.cmsPage?.content;
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {CMSPageData?.title
            ? CMSPageData?.title
            : "Watches Warranty | TrueFacet"}
        </title>
        <meta
          name="description"
          content={
            CMSPageData?.meta_description
              ? CMSPageData?.meta_description
              : "TrueFacet offers a limited warranty on all watches sold through our marketplace. Under the TrueFacet warranty, we will repair any defects in the materials or workmanship as defined by the original manufacturer’s warranty."
          }
        />
        <meta
          name="keywords"
          content={
            CMSPageData?.meta_keywords
              ? CMSPageData?.meta_keywords
              : "Watches Warranty | TrueFacet"
          }
        ></meta>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.baseURL}watch-warranty`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={
            CMSPageData?.title
              ? CMSPageData?.title
              : "Watches Warranty | TrueFacet"
          }
        />
        <meta
          property="og:description"
          content={
            CMSPageData?.meta_description
              ? CMSPageData?.meta_description
              : "TrueFacet offers a limited warranty on all watches sold through our marketplace. Under the TrueFacet warranty, we will repair any defects in the materials or workmanship as defined by the original manufacturer’s warranty."
          }
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}watch-warranty`}
        />
        <meta property="og:site_name" content="TrueFacet" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/Warranty.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/Warranty.png`}
        />
        <meta property="og:image:width" content="931" />
        <meta property="og:image:height" content="381" />
        <meta
          property="og:image:alt"
          content={
            CMSPageData?.title
              ? CMSPageData?.title
              : "Watches Warranty | TrueFacet"
          }
        />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={
            CMSPageData?.title
              ? CMSPageData?.title
              : "Watches Warranty | TrueFacet"
          }
        />
        <meta
          name="twitter:description"
          content={
            CMSPageData?.meta_description
              ? CMSPageData?.meta_description
              : "TrueFacet offers a limited warranty on all watches sold through our marketplace. Under the TrueFacet warranty, we will repair any defects in the materials or workmanship as defined by the original manufacturer’s warranty."
          }
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/Warranty.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
      <div className="warranty-free-space"></div>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </>
  );
}
export default WatchWarranty;

export async function getStaticProps() {
  const client = new Client();
  let CMSPageData = null;

  try {
    CMSPageData = await client.fetchWatchWarrantyCMSPages();
  } catch (error) {}

  return {
    props: {
      CMSPageData,
    },
  };
}
