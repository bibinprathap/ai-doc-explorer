"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Sources Explorer", path: "/sources" },
  { name: "Extract Sources", path: "/extract-sources" },
  { name: "Direct Explorer", path: "/direct" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Nexus
            </span>
          </motion.div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/80 shadow-sm border border-gray-200 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      {item.name}
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-1.5 w-2 h-2 rounded-full bg-blue-500"
                        />
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </nav>
  );
}