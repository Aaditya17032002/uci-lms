import { TimesheetPage } from "../../modules/timesheet/timesheet-page"

interface TimesheetProps {
  isDarkMode?: boolean
  sidebarOpen?: boolean
}

export default function Timesheet({ isDarkMode, sidebarOpen }: TimesheetProps) {
  return <TimesheetPage/>
}
