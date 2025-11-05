
import React from 'react';

const Pumpkin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a9 9 0 0 0-9 9c0 5.52 4.03 10 9 10s9-4.48 9-10A9 9 0 0 0 12 2z" fill="#f97316" stroke="none" />
    <path d="M12 2c-2.4 0-4.6.8-6.4 2.2" stroke="#e36414" strokeWidth="1" />
    <path d="M21 11c-2.5 0-4.5 2.02-4.5 4.5" stroke="#e36414" strokeWidth="1" />
    <path d="M3 11c2.5 0 4.5 2.02 4.5 4.5" stroke="#e36414" strokeWidth="1" />
    <path d="M15.5 8.5l-1.5 1.5" stroke="black" strokeWidth="1.5" />
    <path d="M8.5 8.5l1.5 1.5" stroke="black" strokeWidth="1.5" />
    <path d="M9 14c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5" stroke="black" strokeWidth="1.5" />
    <path d="M12 2v-1.5a1.5 1.5 0 0 1 3 0V2" stroke="#4d7c0f" strokeWidth="2.5" />
  </svg>
);

const Bat = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-1 0V3a.5.5 0 0 1 .5-.5Z" />
    <path d="M12.5 5.5a.5.5 0 0 0-1 0V6h1V5.5Z" />
    <path d="M14 6.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V6h4v.5Z" />
    <path
      d="M13 8.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1h2v1ZM12.75 10a.75.75 0 0 0-1.5 0V11h1.5v-1Z"
      fillOpacity=".5"
    />
    <path d="M16.5 6.43c0 .35-.18.83-.53 1.28l-1.2 1.5A.5.5 0 0 1 14.22 9h-1.3l-.01-1.5h1.36a.5.5 0 0 0 .38-.18l1.2-1.5c.35-.45.55-.93.55-1.28V4a1 1 0 0 0-1-1h-1.58a.5.5 0 0 1-.45-.28l-.5-1a.5.5 0 0 0-.94 0l-.5 1a.5.5 0 0 1-.45.28H7a1 1 0 0 0-1 1v.43c0 .35.18.83.53 1.28l1.2 1.5a.5.5 0 0 0 .38.18h1.36V9h-1.3a.5.5 0 0 1-.45-.78l-1.2-1.5A2.99 2.99 0 0 1 5 4.43V4a2 2 0 0 1 2-2h1.08a1.5 1.5 0 0 1 1.35.83l.5 1a1.5 1.5 0 0 1 2.14 0l.5-1A1.5 1.5 0 0 1 15.92 2H17a2 2 0 0 1 2 2v.43c0 .87-.43 2.08-1.28 3.07l-1.2 1.5a.5.5 0 0 1-.45.28h-1.3v1.5h1.3a1.5 1.5 0 0 0 1.35-2.35l1.2-1.5c.85-1 1.28-2.2 1.28-3.07V4a3 3 0 0 0-3-3h-1.08a.5.5 0 0 0-.45.28l-.5 1a.5.5 0 0 0 0 .44l.5 1a.5.5 0 0 0 .45.28H17a2 2 0 0 1 2 2v.43c0 .87-.43 2.08-1.28 3.07l-1.2 1.5a1.5 1.5 0 0 1-1.35 1.18h-1.3V11h.03a1.5 1.5 0 0 0 1.5-1.47v-.03h-1.6l.01 1.5H13a.5.5 0 0 1 0 1h-1.5v2.25c0 .69-.56 1.25-1.25 1.25h-1.5A1.25 1.25 0 0 1 7.5 14.25V12H6a.5.5 0 0 1 0-1h1.47v-1.5H5.8a1.5 1.5 0 0 0-1.35 2.35l1.2 1.5c.85 1 1.28 2.2 1.28 3.07V19a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1.5h4v1.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.07c0-.87.43-2.08 1.28-3.07l1.2-1.5a1.5 1.5 0 0 0 .17-1.78Z" />
  </svg>
);

export function HalloweenTheme() {
  return (
    <>
      {/* Top Left */}
      <Pumpkin className="absolute top-4 left-4 h-12 w-12 -rotate-12 text-black opacity-80 md:h-16 md:w-16" />
      <Bat className="absolute top-24 left-16 h-8 w-8 hidden md:block text-black opacity-70" />
      <Bat className="absolute top-12 left-32 h-6 w-6 hidden md:block text-black opacity-60 -rotate-12" />

      {/* Top Right */}
      <Pumpkin className="absolute top-8 right-8 h-16 w-16 rotate-12 text-black opacity-80 md:h-20 md:w-20" />
      <Bat className="absolute top-32 right-12 h-10 w-10 hidden md:block text-black opacity-70 rotate-12" />
      
      {/* Bottom Left */}
      <Bat className="absolute bottom-16 left-8 h-12 w-12 hidden md:block text-black opacity-70" />

      {/* Bottom Right */}
      <Pumpkin className="absolute bottom-4 right-4 h-12 w-12 -rotate-6 text-black opacity-80 md:h-16 md:w-16" />
      <Bat className="absolute bottom-24 right-16 h-8 w-8 hidden md:block text-black opacity-60 rotate-6" />
      <Bat className="absolute bottom-12 right-32 h-6 w-6 hidden md:block text-black opacity-50" />
    </>
  );
}
