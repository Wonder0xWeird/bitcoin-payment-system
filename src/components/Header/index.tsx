'use client';

import { Branding } from "./Branding";
import { Profile } from "./Profile";

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
        <Branding />
        <Profile />
      </div>
    </header>
  );
}