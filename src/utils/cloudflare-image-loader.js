// src/utils/cloudflare-image-loader.js
export default function cloudflareLoader({ src, width, quality }) {
    const params = [`w=${width}`];
    
    if (quality) {
      params.push(`q=${quality}`);
    }
    
    const paramsString = params.join(',');
    
    // 如果是外部 URL，直接返回
    if (src.startsWith('http')) {
      return src;
    }
    
    // 使用 Cloudflare Image Resizing
    return `/cdn-cgi/image/${paramsString}/${src}`;
  }