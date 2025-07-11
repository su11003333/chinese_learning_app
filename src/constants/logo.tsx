// src/constants/logo.tsx
import React from 'react';
import logoImg from "./logo.png"
// 畢業帽SVG路徑常量
export const GRADUATION_CAP_PATHS = {
  path1: "M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 714.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z",
  path2: "M13.06 15.473a48.45 48.45 0 717.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 716 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 713.44 1.668 2.25 2.25 0 002.12 0z",
  path3: "M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z"
};

// 品牌信息常量
export const BRAND = {
  name: "小字苗",
  fullName: "小字苗-國小漢字學習平台",
  description: "專為國小學童設計的中文漢字學習平台"
};

// Logo組件
interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  fill?: string;
}

export const GraduationCapLogo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  className = '', 
  fill = 'currentColor' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-12 h-12'
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill={fill}
      className={`${sizeClasses[size]} ${className}`}
    >
      <path d={GRADUATION_CAP_PATHS.path1} />
      <path d={GRADUATION_CAP_PATHS.path2} />
      <path d={GRADUATION_CAP_PATHS.path3} />
    </svg>
  );
};

// 不同變體的Logo組件
export const NavbarLogo: React.FC = () => (
  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mr-2">
    <GraduationCapLogo fill="white" />
  </div>
);

export const FooterLogo: React.FC = () => (
  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
    <GraduationCapLogo size="small" fill="white" />
  </div>
);

export const HeroLogo: React.FC = () => (
  <div className="relative w-32 h-32 sm:w-40 sm:h-40">
    <div className="absolute w-full h-full bg-pink-200 rounded-full flex items-center justify-center">
      <div className="w-5/6 h-5/6 bg-pink-300 rounded-full flex items-center justify-center">
        <GraduationCapLogo size="large" fill="white" className="w-12 h-12 sm:w-16 sm:h-16" />
      </div>
    </div>
  </div>
);

export const BigLogo: React.FC = () => (
  
       <img  src={logoImg.src} alt="Logo" className="w-full h-full "/>



);