import React from "react"
import "./globals.css"
import ClientLayout from "./client-layout"
 
interface RootLayoutProps {
  children: React.ReactNode
}
 
export default function RootLayout({ children }: RootLayoutProps) {
  return (
<ClientLayout>
      {children}
</ClientLayout>
  )
}