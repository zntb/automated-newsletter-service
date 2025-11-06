"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Trash2, Download, Filter } from "lucide-react"

const mockSubscribers = [
  { id: 1, email: "john@example.com", status: "active", joinedDate: "2024-01-15", lastOpened: "2024-12-01" },
  { id: 2, email: "jane@example.com", status: "active", joinedDate: "2024-01-20", lastOpened: "2024-11-28" },
  { id: 3, email: "bob@example.com", status: "unsubscribed", joinedDate: "2024-01-10", lastOpened: "2024-10-15" },
  { id: 4, email: "alice@example.com", status: "active", joinedDate: "2024-02-01", lastOpened: "2024-12-02" },
  { id: 5, email: "charlie@example.com", status: "active", joinedDate: "2024-02-05", lastOpened: "2024-11-30" },
  { id: 6, email: "diana@example.com", status: "bounced", joinedDate: "2024-02-10", lastOpened: null },
  { id: 7, email: "evan@example.com", status: "active", joinedDate: "2024-03-01", lastOpened: "2024-11-25" },
]

export default function SubscribersList() {
  const [search, setSearch] = useState("")
  const [subscribers, setSubscribers] = useState(mockSubscribers)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = () => {
    if (selectedIds.length === filteredSubscribers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredSubscribers.map((s) => s.id))
    }
  }

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]))
  }

  const handleDelete = (id: number) => {
    setSubscribers(subscribers.filter((sub) => sub.id !== id))
    setSelectedIds(selectedIds.filter((sid) => sid !== id))
  }

  const handleBulkDelete = () => {
    setSubscribers(subscribers.filter((sub) => !selectedIds.includes(sub.id)))
    setSelectedIds([])
  }

  const handleExport = () => {
    const csv = [
      ["Email", "Status", "Joined Date", "Last Opened"],
      ...filteredSubscribers.map((s) => [s.email, s.status, s.joinedDate, s.lastOpened || "Never"]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "subscribers.csv"
    a.click()
  }

  const activeCount = subscribers.filter((s) => s.status === "active").length
  const inactiveCount = subscribers.filter((s) => s.status === "unsubscribed").length
  const bouncedCount = subscribers.filter((s) => s.status === "bounced").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-accent">{activeCount}</p>
        </Card>
        <Card className="bg-card p-4">
          <p className="text-sm text-muted-foreground">Unsubscribed</p>
          <p className="text-2xl font-bold text-destructive">{inactiveCount}</p>
        </Card>
        <Card className="bg-card p-4">
          <p className="text-sm text-muted-foreground">Bounced</p>
          <p className="text-2xl font-bold text-muted-foreground">{bouncedCount}</p>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => setStatusFilter(statusFilter === "all" ? "active" : "all")}
            >
              <Filter className="h-4 w-4" />
              {statusFilter === "all" ? "All" : "Active"}
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <Card className="bg-accent/10 border-accent/20 p-4 flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedIds.length} subscriber{selectedIds.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])} className="bg-transparent">
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Table */}
      <Card className="bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left">
                  <Checkbox
                    checked={selectedIds.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Last Opened</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedIds.includes(subscriber.id)}
                        onChange={() => handleSelectOne(subscriber.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">{subscriber.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === "active"
                            ? "bg-accent/20 text-accent"
                            : subscriber.status === "bounced"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{subscriber.joinedDate}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{subscriber.lastOpened || "Never"}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subscriber.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filteredSubscribers.length} of {subscribers.length} subscribers
      </div>
    </div>
  )
}
