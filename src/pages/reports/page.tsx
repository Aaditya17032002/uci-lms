import { PlaceholderPage } from "../../common/placeholder-page"
import { BarChart3 } from 'lucide-react'
 
interface ReportsProps {
  isDarkMode?: boolean
  sidebarOpen?: boolean
}

export default function Reports({ isDarkMode, sidebarOpen }: ReportsProps) {
  return <PlaceholderPage title="Reports" icon={<BarChart3 className="h-6 w-6" />}  />
}
