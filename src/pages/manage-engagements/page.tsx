import { ManageEngagementsPage } from "../../modules/manage-engagements"
 
interface ManageEngagementsProps {
  isDarkMode?: boolean
  sidebarOpen?: boolean
}

export default function ManageEngagements({ isDarkMode, sidebarOpen }: ManageEngagementsProps) {
  return <ManageEngagementsPage isDarkMode={isDarkMode}/>
}
