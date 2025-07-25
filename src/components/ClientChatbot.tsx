'use client'

import { useEffect, useState } from 'react'

export default function ClientChatbot() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="chatbot-widget-container">
        {/* Chatbot Toggle Button */}
        <button 
          className="chatbot-toggle-btn bg-electric-lime hover:bg-electric-lime/90 text-navy-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="Chat with BlueLicht IP Assistant"
        >
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        
        {/* Notification Dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">1</span>
        </div>
        
        {/* Hover Preview */}
        <div className="absolute bottom-16 right-0 bg-glass-panel backdrop-blur-lg rounded-lg p-3 opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:pointer-events-auto shadow-xl border border-white/10 min-w-[250px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-electric-lime rounded-full flex items-center justify-center">
              <span className="text-navy-black text-xs font-bold">AI</span>
            </div>
            <span className="text-white font-medium text-sm">BlueLicht IP Assistant</span>
          </div>
          <p className="text-white/70 text-xs">
            Hi! 👋 I can help you with patent and trademark questions. Click to start chatting!
          </p>
          <div className="flex gap-2 mt-2">
            <span className="bg-electric-lime/20 text-electric-lime text-xs px-2 py-1 rounded">Patents</span>
            <span className="bg-electric-lime/20 text-electric-lime text-xs px-2 py-1 rounded">Costs</span>
          </div>
        </div>
      </div>
    </div>
  )
}