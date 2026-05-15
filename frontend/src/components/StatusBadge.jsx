const statusMap = {
  "Open": "badge-open",
  "Assigned": "badge-assigned",
  "In Progress": "badge-inprogress",
  "Pending Customer Response": "badge-pending",
  "Escalated": "badge-escalated",
  "Resolved": "badge-resolved",
  "Closed": "badge-closed",
};

const priorityMap = {
  "Low": "priority-low",
  "Medium": "priority-medium",
  "High": "priority-high",
  "Critical": "priority-critical",
};

export function StatusBadge({ status }) {
  return <span className={`badge ${statusMap[status] || "badge-open"}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge ${priorityMap[priority] || "priority-medium"}`}>{priority}</span>;
}
