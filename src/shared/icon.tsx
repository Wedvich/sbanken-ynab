import React from 'react';

interface IconProps {
  src: string;
  title: string;
}

const Icon = ({ src, title }: IconProps) => {
  const sanitizedHtml = src.replace(/<title>.+?<\/title>/gi, '');
  return (
    <div
      className="sby-icon"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      title={title}
    />
  );
};

export default React.memo(Icon);
