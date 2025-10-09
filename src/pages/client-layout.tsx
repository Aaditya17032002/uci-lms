// "use client"

// import React, { useState, useEffect } from "react"
// import { Sidebar } from "../layout/sidebar"
// import { Header } from "../layout/header"
// import { Footer } from "../layout/footer"
// import "./globals.css"
// import { useLocation } from "react-router-dom"


// interface ClientLayoutProps {
//   children: React.ReactNode
// }

// export default function ClientLayout({ children }: ClientLayoutProps) {
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [isDarkMode, setIsDarkMode] = useState(false)
//   const location = useLocation();

//   // detect login page
//   const isLoginPage = location.pathname === "/"

//   useEffect(() => {

//     if (isDarkMode) {
//       document.documentElement.classList.add("dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//     }
//   }, [isDarkMode])

//   const handleToggleSidebar = () => {
//     setSidebarOpen(prev => {
//       return !prev;
//     });
//   };

//   const handleToggleTheme = () => {
//     console.log('handleToggleTheme called!');
//   };

//   if (isLoginPage) {
//     // 🟢 Login page should ONLY render its children (no layout)
//     return <>{children}</>
//   }

//   // 🟢 For all other pages: render layout with header, sidebar, footer
//   return (
//     <div
//       className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
//     >
//       <Header
//         onSidebarToggle={handleToggleSidebar}
//         onThemeToggle={handleToggleTheme}
//       />
//       <Sidebar
//         isOpen={sidebarOpen}
//         onToggle={handleToggleSidebar}
//       />

//       <main
//         className={`flex-1 pt-16 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""
//           } overflow-x-hidden`}
//       >
//         <div className="min-h-full flex flex-col w-full max-w-full">
//           {children}
//         </div>
//       </main>

//       <Footer isDarkMode={isDarkMode} />
//     </div>
//   )
// }


"use client"

import React, { useState, useEffect } from "react"

import { Sidebar } from "../layout/sidebar"

import { Header } from "../layout/header"

import { Footer } from "../layout/footer"

import { useLocation } from "react-router-dom"

import "./globals.css"
import { Toaster } from "../ui/toaster"

interface ClientLayoutProps {

  children: React.ReactNode

}

export default function ClientLayout({ children }: ClientLayoutProps) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [isDarkMode, setIsDarkMode] = useState(false)

  const location = useLocation()

  const [roleId, setRoleId] = useState<string | null>(null);

  useEffect(() => {
    const storedRoleId = localStorage.getItem("roleId");
    if (storedRoleId) setRoleId(storedRoleId);
  }, []);

  // detect login page (or any auth-only pages)
  const isLoginPage = location.pathname === "/"

  useEffect(() => {

    if (isDarkMode) {

      document.documentElement.classList.add("dark")

    } else {

      document.documentElement.classList.remove("dark")

    }

  }, [isDarkMode])

  const handleToggleSidebar = () => setSidebarOpen(prev => !prev)

  const handleToggleTheme = () => setIsDarkMode(prev => !prev)


  // If on login page, render children only

  if (isLoginPage) return <>{children}</>

  // For all other pages, render layout with sidebar/header/footer

  return (
    <div

      className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"

        }`}
    >
      <Header onSidebarToggle={handleToggleSidebar} onThemeToggle={handleToggleTheme} />
      <Sidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} roleId={roleId || "employee"} />
      console.log("RoleId in ClientLayout:", roleId);
      <main

        className={`flex-1 pt-16 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""

          } overflow-x-hidden`}
      >
        <div className="min-h-full flex flex-col w-full max-w-full">{children}</div>
      </main>
      <Footer isDarkMode={isDarkMode} />
      <Toaster />
    </div>

  )

}