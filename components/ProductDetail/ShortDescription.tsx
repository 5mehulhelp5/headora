import React, { useEffect, useState } from "react";
import styles from "../../styles/ProductDetail.module.css";
import Link from "next/link";

function ShortDescription({
  currentVariant,
  configurableOptions,
  aggregations,
}: any) {
  const [descriptionHTML, setdescriptionHTML] = useState<any>("");
  const [FullDescriptionHTML, setFullDescriptionHTML] = useState<any>()
  const AdditionalAttributes = [
    "color",
    "metal_type",
    "gender",
    "condition",
    "collar_type",
    "neck_types",
    "sleeve",
    "logo_postion",
    "collar_color",
    "logo_color",
    "t_shrit_color",
    "fashion_color",
    "fashion_size",
    "number_of_stones",
    "stone_type",
    "manufacturer",
    "model_rolex",
    "watch_metal_type",
    "dial_color",
    "bezel",
    "ring_size",
    "jewelry_metal_type",
    "bracelet_size",
    "stone_shape",
    "stone_color",
    "type_of_cartier_bracelet",
    "chain_type",
    "case_diameter",
    "model_name",
    "material_name",
    "bazel_name",
    "bracelet_name",
    "dial_name",
    "needle_name",
    "cartier_bracelet_size",
    "paving",
  ];
    useEffect(() => {
      if (currentVariant && currentVariant.description) {
        let htmlData = typeof currentVariant.description === 'string'
          ? currentVariant.description
          : currentVariant.description.html || '';
  
        // Format the HTML content
        htmlData = htmlData
          .replace(/(?:\r\n|\r|\n)/g, '<br>') // Replace line breaks with <br>
          .replace(/<br><br>/g, '<br>') // Remove double <br>
          .replace(/<\/p><br><p>/g, '</p><p>'); // Fix <p> and <br> tag mismatch
        htmlData = `<p>${htmlData}</p>`; // Wrap content in <p> tags
  
        setFullDescriptionHTML(htmlData);
      }
    }, [currentVariant]);
  useEffect(() => {
    let htmlData: any = " ";
    if (currentVariant && currentVariant.short_description) {
      htmlData =
        currentVariant.short_description.html &&
        currentVariant.short_description.html != ""
          ? currentVariant.short_description.html
          : currentVariant.short_description;
      htmlData = htmlData + " ";
      htmlData = htmlData.replaceAll(/(?:\r\n|\r|\n)/g, "<br>");
      htmlData = htmlData.replaceAll("<br><br>", "<br>");
      htmlData = htmlData.replaceAll("</p><br><p>", "</p><p>");
      htmlData = `<p>${htmlData}</p>`; // Wrap the entire string in <p> tags
      htmlData = htmlData
        .replace(/<style[^>]*>.*<\/style>/g, "")
        // Remove script tags and content
        .replace(/<script[^>]*>.*<\/script>/g, "")
        // Remove all opening, closing and orphan HTML tags
        .replace(/<[^>]+>/g, "")
        // Remove leading spaces and repeated CR/LF
        .replace(/([\r\n]+ +)+/g, "");
      setdescriptionHTML(htmlData);
    } else {
      if (currentVariant && currentVariant.description) {
        htmlData = currentVariant.description.html
          ? currentVariant.description.html
          : currentVariant.description;
        htmlData = htmlData + " ";
        htmlData = htmlData.replaceAll(/(?:\r\n|\r|\n)/g, "<br>");
        htmlData = htmlData.replaceAll("<br><br>", "<br>");
        htmlData = htmlData.replaceAll("</p><br><p>", "</p><p>");

        htmlData = htmlData
          .replace(/<style[^>]*>.*<\/style>/g, "")
          // Remove script tags and content
          .replace(/<script[^>]*>.*<\/script>/g, "")
          // Remove all opening, closing and orphan HTML tags
          .replace(/<[^>]+>/g, "")
          // Remove leading spaces and repeated CR/LF
          .replace(/([\r\n]+ +)+/g, "");
        htmlData = htmlData.slice(0, 200) + " ...";
        htmlData = `<p>${htmlData}</p>`; // Wrap the entire string in <p> tags
        setdescriptionHTML(htmlData);
      }
    }
  }, [currentVariant]);

  const attributeLabels = (key: string) => {
    return key.replaceAll("_", " ");
  };

  const isconfigurableOptions = (attribute: any) => {
    let added = false;
    configurableOptions.forEach((element: any) => {
      if (element.attribute_code == attribute) {
        added = true;
      }
    });
    return added;
  };
  return (
    <>
      <div
        className={
          styles.productDetailDescriptionContainer +
          " " +
          styles.productShortDetailDescriptionContainer
        }
      >
        <p>TrueFacet promises authenticity of our products. Learn more about TrueFacet's <Link href={'/authenticity-promise'}>authenticity promise</Link>. </p>
        {/* <div dangerouslySetInnerHTML={{ __html: descriptionHTML }} /> */}
      </div>

      {currentVariant.attributes && currentVariant.attributes.length && (
        <div className={styles.productAttributes}>
          {currentVariant.attributes.map((attribute: any) => (
            <>
              {!isconfigurableOptions(attribute.code) && (
                <p>
                  <b>{attributeLabels(attribute.code)}</b>
                  {attribute.label}
                </p>
              )}
            </>
          ))}

     
        </div>
      )}
        {aggregations
        ?.filter(
          (aggregation: any) =>
            aggregation.attribute_code !== "price" && aggregation.attribute_code !== "category_id",
        )
  .map((aggregation: any) => (
    <p key={aggregation.index} className={styles.ShortDescriptionProductAttributes}>
    <b style={{textTransform:'uppercase', color:'#6f6f6f'}}>{aggregation?.label.replaceAll("_", " ")}: </b>
      {aggregation.options.map((option: any, index: number) => (
        <span key={index}>{option.label}</span>
      ))}
    </p>
))}
          <div className={styles.productDetailNewDescriptionContainer}>
            <div dangerouslySetInnerHTML={{ __html: FullDescriptionHTML }} />
          </div>
    </>
  );
}
export default ShortDescription;
