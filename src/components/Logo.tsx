import React from 'react';
import { cn } from '../lib/utils';

import logoImg from '../assets/images/regenerated_image_1777829121829.png';

interface LogoProps {
  className?: string;
  showBackground?: boolean;
}

export const Logo = ({ className, showBackground = true }: LogoProps) => {
  if (showBackground) {
    return (
      <img 
        src={logoImg} 
        alt="Lumina" 
        className={cn("object-contain", className)} 
      />
    );
  }

  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("object-contain", className)}
    >
      {/* Book */}
      <path d="M256 420V330M256 330C280 330 330 330 370 350V430C330 410 280 410 256 410C232 410 182 410 142 430V350C182 330 232 330 256 330Z" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Lightbulb Body */}
      <path d="M256 160C210 160 185 200 185 240C185 275 205 300 215 320V360H297V320C307 300 327 275 327 240C327 200 302 160 256 160Z" stroke="currentColor" strokeWidth="18" strokeLinejoin="round"/>
      {/* Bulb Threads */}
      <path d="M230 375H282M235 390H277M245 405H267" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
      {/* Graduation Cap */}
      <path d="M430 140L256 60L82 140L256 220L430 140Z" stroke="currentColor" strokeWidth="18" strokeLinejoin="round"/>
      <path d="M145 170V210C145 235 195 255 256 255C317 255 367 235 367 210V170" stroke="currentColor" strokeWidth="18" strokeLinejoin="round"/>
      {/* Tassel */}
      <path d="M125 130V200" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/>
      <rect x="115" y="200" width="20" height="25" rx="4" fill="currentColor"/>
      {/* Spark */}
      <path d="M256 210L264 236L290 244L264 252L256 278L248 252L222 244L248 236L256 210Z" fill="currentColor"/>
    </svg>
  );
};
