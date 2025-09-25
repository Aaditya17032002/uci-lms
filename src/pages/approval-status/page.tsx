import { ApprovalStatusPage } from "../../modules/approval-status"

interface ApprovalStatusProps {
  isDarkMode: boolean
}

export default function ApprovalStatus({ isDarkMode }: ApprovalStatusProps) {
  return <ApprovalStatusPage />
}
