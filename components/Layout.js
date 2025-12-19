"use client";
import React from "react";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] font-[Poppins]">
      
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content Wrapper */}
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
