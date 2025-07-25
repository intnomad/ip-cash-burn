"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm here to help with your IP questions. What would you like to know?",
      isBot: true,
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        isBot: true,
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("cost") || lowerInput.includes("price")) {
      return "IP costs vary by type and jurisdiction. Patents typically range from $3,000-$7,000, trademarks $1,000-$2,000, and designs $1,500-$2,500. Use our calculator for precise estimates!"
    }

    if (lowerInput.includes("patent")) {
      return "Patents protect inventions and technical innovations. They typically last 20 years and require detailed technical documentation. Would you like to know about the application process?"
    }

    if (lowerInput.includes("trademark")) {
      return "Trademarks protect brand names, logos, and slogans. They can last indefinitely with proper renewal. Registration typically takes 6-12 months."
    }

    if (lowerInput.includes("time") || lowerInput.includes("how long")) {
      return "Processing times vary: Patents (18-36 months), Trademarks (6-12 months), Designs (6-18 months). Priority filing can expedite the process."
    }

    return "That's a great question! For detailed information about your specific situation, I'd recommend using our cost calculator or booking a consultation with our IP experts."
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-electric-lime to-lime-bright rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <MessageCircle className="w-6 h-6 text-navy-black" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-80 h-96 glass-panel z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-electric-lime rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-navy-black" />
                </div>
                <span className="text-white font-medium">IP Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.isBot ? "bg-surface-glass text-white" : "bg-electric-lime text-navy-black"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-subtle">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about IP costs, processes..."
                  className="form-input flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" className="btn-primary px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
