"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ActivityMonitor() {
  const [lastActivity, setLastActivity] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState<boolean>(true)
  const [currentTask, setCurrentTask] = useState<string>("Word Document")
  const [activityLog, setActivityLog] = useState<Array<{ time: Date; action: string }>>([])
  const [inactivityThreshold, setInactivityThreshold] = useState<number>(2) // minutes
  const { toast } = useToast()

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(new Date())
      if (!isActive) {
        setIsActive(true)
        logActivity("User resumed activity")
        toast({
          title: "Activity Detected",
          description: "User has resumed working on the document",
        })
      }
    }

    // Set up event listeners for user activity
    window.addEventListener("keydown", updateActivity)
    window.addEventListener("mousemove", updateActivity)
    window.addEventListener("click", updateActivity)
    window.addEventListener("scroll", updateActivity)

    // Check for inactivity every 30 seconds
    const inactivityCheck = setInterval(() => {
      const currentTime = new Date()
      const timeDiff = (currentTime.getTime() - lastActivity.getTime()) / (1000 * 60) // in minutes

      if (timeDiff >= inactivityThreshold && isActive) {
        setIsActive(false)
        logActivity(`User inactive for ${inactivityThreshold} minutes`)
        // Alert manager about inactivity
        toast({
          variant: "destructive",
          title: "Inactivity Alert",
          description: `User has been inactive on ${currentTask} for ${inactivityThreshold} minutes`,
        })
      }
    }, 30000)

    // Initial activity log
    logActivity("Session started")

    return () => {
      window.removeEventListener("keydown", updateActivity)
      window.removeEventListener("mousemove", updateActivity)
      window.removeEventListener("click", updateActivity)
      window.removeEventListener("scroll", updateActivity)
      clearInterval(inactivityCheck)
    }
  }, [lastActivity, isActive, inactivityThreshold, currentTask])

  const logActivity = (action: string) => {
    setActivityLog((prev) => [...prev, { time: new Date(), action }])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString()
  }

  const getTimeSinceLastActivity = () => {
    const currentTime = new Date()
    const seconds = Math.floor((currentTime.getTime() - lastActivity.getTime()) / 1000)

    if (seconds < 60) {
      return `${seconds} seconds ago`
    } else {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Activity Monitoring Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>User activity monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Task:</p>
                <p className="font-medium">{currentTask}</p>
              </div>
              <Badge variant={isActive ? "default" : "destructive"} className="text-xs">
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last activity: {getTimeSinceLastActivity()}</span>
            </div>

            <div className="mt-4">
              {isActive ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>User is currently working on the document</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>User appears to be away from the document</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure monitoring parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Inactivity Alert Threshold (minutes)</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInactivityThreshold((prev) => Math.max(1, prev - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center">{inactivityThreshold}</span>
                <Button variant="outline" size="sm" onClick={() => setInactivityThreshold((prev) => prev + 1)}>
                  +
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Test Alert Sent",
                    description: "A test inactivity alert has been sent to the manager",
                  })
                  logActivity("Test alert sent")
                }}
              >
                Send Test Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {activityLog
              .slice()
              .reverse()
              .map((log, index) => (
                <div key={index} className="flex items-start gap-2 pb-2 border-b">
                  <div className="text-xs text-muted-foreground w-20">{formatTime(log.time)}</div>
                  <div className="text-sm">{log.action}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

