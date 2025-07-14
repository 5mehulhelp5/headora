import React, { useState } from 'react';
import styles from '../../styles/Categories.module.css';



export default function Content({ description }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to count words in a string
  const countWords = (text: string) => {
    if(text && text.length>0){
      return text?.split(/\s+/).filter(Boolean).length;
    }else{
      return 0
    }
  };

  // Function to truncate the text to 130 words
  const truncateText = (text: string, wordLimit: number) => {
    if(text && text.length>0){
    return text.split(/\s+/).slice(0, wordLimit).join(' ') + '...';
  }else{
    return text
  }
  };

  const wordLimit = 130;
  const isLongDescription = countWords(description) > wordLimit;
  const displayText = isExpanded ? description : truncateText(description, wordLimit);

  if(displayText){
    return (
    <div className={styles.descriptionContainer}>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: displayText }}
      />
      {isLongDescription && (
        <span
          className="showDescriptionToggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </span>
      )}
    </div>
  );
}
}
