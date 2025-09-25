//== responsive ==

"use client"
 
import { Mail } from "lucide-react"
import { FeedbackModal } from "../modals/feedback-modal"
import { useState } from "react"
 
interface FooterProps {
  isDarkMode?: boolean
}
 
export function Footer({ isDarkMode }: FooterProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
 
  const openFeedbackModal = () => setIsFeedbackModalOpen(true)
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false)
 
  return (
    <>
      <footer
        className={`border-t mt-auto relative ${
          isDarkMode
            ? "bg-gray-900 border-gray-700 text-gray-300"
            : "bg-white border-gray-200 text-gray-600"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Useful Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
            <a
              href="https://netorg207568.sharepoint.com/sites/UCITMS-SupportSite/SitePages/CollabHome.aspx?csf=1&web=1&e=amy1UY&CID=f6283b8d-5c3a-4dac-9bbb-3564a4e4b090"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support Site
            </a>
            <span className="hidden sm:inline">|</span>
            <button
              onClick={openFeedbackModal}
              className="hover:underline cursor-pointer"
            >
              Feedback Form
            </button>
            <span className="hidden sm:inline">|</span>
            <a href="https://www.uciny.com/index.html"
            className="hover:underline"
            target="_blank"
rel="noopener noreferrer">Company Website</a>
          </div>
 
          {/* Social Icons */}
          <div className="flex justify-center gap-6">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/uci_india/"
              aria-label="Instagram"
              className="hover:text-pink-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M12 2.2c3.2 0 3.6.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.23-.15-4.77-1.67-4.92-4.92C2.21 15.63 2.2 15.25 2.2 12s.01-3.58.07-4.85C2.42 3.92 3.94 2.38 7.17 2.23 8.44 2.17 8.82 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.35 2.63 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.63 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.3.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1012 18.16 6.16 6.16 0 0012 5.84zm0 10.17A4 4 0 1112 8a4 4 0 010 8zm6.41-11.85a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
              </svg>
            </a>
 
            {/* LinkedIn */}
            <a
              href="https://in.linkedin.com/company/unite-computech-info-india-pvt-ltd"
              aria-label="LinkedIn"
              className="hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zm7 0h3.8v2.1h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6v9.3h-4V15.5c0-2.1 0-4.9-3-4.9s-3.4 2.3-3.4 4.8V24h-4V8.5z" />
              </svg>
            </a>
 
            {/* Mail */}
            <a
              href="mailto:hr@uci-india.com"
              aria-label="Email"
              className="hover:text-red-500"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
 
        {/* Copyright & Logo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm mt-2 pb-4">
          <span>© 2025</span>
          <div className="flex items-center gap-2">
            <img
              src="/images/uci-logo.png"
              alt="UCI Logo"
              width={20}
              height={20}
              className="rounded-full"
            />
            <span>Unite Computech Info Pvt. Ltd.</span>
          </div>
        </div>
      </footer>
 
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={closeFeedbackModal}
        isDarkMode={isDarkMode}
      />
    </>
  )
}
 