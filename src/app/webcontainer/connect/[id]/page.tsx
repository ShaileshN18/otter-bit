"use client";

import { useEffect } from "react";

export default function WebContainerConnectPage() {
  useEffect(() => {
    // Handle WebContainer connection completion callback
    if (window.opener) {
      try {
        window.opener.postMessage({ type: "webcontainer:connected" }, "*");
      } catch (e) {
        console.warn("Could not post message to opener:", e);
      }
      setTimeout(() => {
        window.close();
      }, 300);
    } else {
      // If navigated in same window, immediately return back to the active workspace page
      setTimeout(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/projects";
        }
      }, 500);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-gray-200 font-sans p-6 text-center">
      <div className="bg-[#161b22] border border-[#21262d] p-6 rounded-xl max-w-sm space-y-3 shadow-xl">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-sm">
          ✓
        </div>
        <h1 className="text-base font-semibold text-white">WebContainer Connected</h1>
        <p className="text-xs text-gray-400">
          Authorization complete. Returning to your project workspace...
        </p>
      </div>
    </div>
  );
}
