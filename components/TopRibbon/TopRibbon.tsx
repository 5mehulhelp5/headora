import { useEffect, useState } from 'react';
import styles from '../../styles/Ribbon.module.css';
function TopRibbon({ribbonResponce}:any) {
    const sanitizedHtml = ribbonResponce?.cmsBlocks?.items?.[0]?.content ;

    return (
        <>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        </>
    )   
}
export default TopRibbon