"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"

interface Passenger {
  id: number
  name: string
  dailyParticipation: ("full" | "one-way" | "none")[]
}

export default function CarpoolCalculator() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const steps = ["Setup", "Daily Participation", "Results"]
  const [showSettings, setShowSettings] = useState<boolean>(false)

  const [dailyPrice, setDailyPrice] = useState<number>(2000)
  const [numberOfDays, setNumberOfDays] = useState<number>(5)
  const [currentDay, setCurrentDay] = useState<number>(0)
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, name: "Car Owner", dailyParticipation: Array(5).fill("full") },
    { id: 2, name: "Passenger 1", dailyParticipation: Array(5).fill("full") },
    { id: 3, name: "Passenger 2", dailyParticipation: Array(5).fill("full") },
    { id: 4, name: "Passenger 3", dailyParticipation: Array(5).fill("full") },
  ])

  useEffect(() => {
    const savedData = localStorage.getItem("carpoolData")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.passengers) setPassengers(parsed.passengers)
        if (parsed.dailyPrice) setDailyPrice(parsed.dailyPrice)
        if (parsed.numberOfDays) setNumberOfDays(parsed.numberOfDays)
      } catch (error) {
        console.log("Error loading saved data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const dataToSave = {
      passengers,
      dailyPrice,
      numberOfDays,
    }
    localStorage.setItem("carpoolData", JSON.stringify(dataToSave))
  }, [passengers, dailyPrice, numberOfDays])

  const setPresetDays = (days: number) => {
    setNumberOfDays(days)
    setCurrentDay(0)
    setPassengers(
      passengers.map((p) => ({
        ...p,
        dailyParticipation: Array(days).fill("full"),
      })),
    )
  }

  const addPassenger = () => {
    const newId = Math.max(...passengers.map((p) => p.id)) + 1
    setPassengers([
      ...passengers,
      {
        id: newId,
        name: `Passenger ${newId}`,
        dailyParticipation: Array(numberOfDays).fill("full"),
      },
    ])
  }

  const removePassenger = (id: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p) => p.id !== id))
    }
  }

  const updateDayParticipation = (passengerId: number, dayIndex: number, tripType: "full" | "one-way" | "none") => {
    setPassengers(
      passengers.map((p) => {
        if (p.id === passengerId) {
          const newParticipation = [...p.dailyParticipation]
          newParticipation[dayIndex] = tripType
          return { ...p, dailyParticipation: newParticipation }
        }
        return p
      }),
    )
  }

  const updatePassengerName = (id: number, name: string) => {
    setPassengers(passengers.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  const calculateCosts = () => {
    let totalCostAllDays = 0
    const passengerTotalCosts: { [key: number]: number } = {}

    passengers.forEach((p) => {
      passengerTotalCosts[p.id] = 0
    })

    for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
      const fullTripPassengers = passengers.filter((p) => p.dailyParticipation[dayIndex] === "full")
      const oneWayPassengers = passengers.filter((p) => p.dailyParticipation[dayIndex] === "one-way")
      const activePassengers = passengers.filter((p) => p.dailyParticipation[dayIndex] !== "none")

      if (activePassengers.length === 0) continue

      const oneWayTotal = oneWayPassengers.length * (dailyPrice / (activePassengers.length * 2))
      const remainingAmount = dailyPrice - oneWayTotal
      const fullTripCostPerPerson = fullTripPassengers.length > 0 ? remainingAmount / fullTripPassengers.length : 0
      const oneWayCostPerPerson = dailyPrice / (activePassengers.length * 2)

      fullTripPassengers.forEach((p) => {
        passengerTotalCosts[p.id] += fullTripCostPerPerson
      })

      oneWayPassengers.forEach((p) => {
        passengerTotalCosts[p.id] += oneWayCostPerPerson
      })

      totalCostAllDays += dailyPrice
    }

    return {
      passengerTotalCosts,
      totalCostAllDays,
      averageDailyCost: totalCostAllDays / numberOfDays,
    }
  }

  const costs = calculateCosts()

  const goToPreviousDay = () => {
    if (currentDay > 0) {
      setCurrentDay(currentDay - 1)
    }
  }

  const goToNextDay = () => {
    if (currentDay < numberOfDays - 1) {
      setCurrentDay(currentDay + 1)
    }
  }

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Setup
        return (
          <Card className="shadow-lg border-border w-full">
            <CardHeader className="bg-card">
              <CardTitle className="text-card-foreground">🔧 Trip Settings</CardTitle>
              <CardDescription>Configure your daily fuel cost and trip duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-price" className="text-sm font-medium">
                    Daily Fuel Cost (Rs)
                  </Label>
                  <Input
                    id="daily-price"
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(Number(e.target.value))}
                    placeholder="2000"
                    className="text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number-days" className="text-sm font-medium">
                    Number of Days
                  </Label>
                  <Input
                    id="number-days"
                    type="number"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(Number(e.target.value))}
                    placeholder="5"
                    min="1"
                    className="text-lg font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">📅 Quick Duration</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setPresetDays(1)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    1 Day
                  </Button>
                  <Button
                    onClick={() => setPresetDays(5)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    1 Week
                  </Button>
                  <Button
                    onClick={() => setPresetDays(10)}
                    size="sm"
                    variant="outline"
                    className="text-primary border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground"
                  >
                    2 Weeks
                  </Button>
                  <Button
                    onClick={() => setPresetDays(22)}
                    size="sm"
                    variant="outline"
                    className="text-primary border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground"
                  >
                    1 Month
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 1: // Daily Participation
        return (
          <Card className="shadow-lg border-border w-full">
            <CardHeader className="bg-card">
              <CardTitle className="text-card-foreground">📋 Daily Participation</CardTitle>
              <CardDescription>Set each passenger&apos;s participation for every day</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <Button
                    onClick={goToPreviousDay}
                    disabled={currentDay === 0}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 bg-transparent"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <div className="text-center">
                    <h4 className="font-bold text-card-foreground text-xl">Day {currentDay + 1}</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentDay + 1} of {numberOfDays} days
                    </p>
                  </div>

                  <Button
                    onClick={goToNextDay}
                    disabled={currentDay === numberOfDays - 1}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 bg-transparent"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {passengers.map((passenger) => (
                    <div key={`${passenger.id}-${currentDay}`} className="p-4 bg-muted rounded-lg">
                      <div className="mb-3">
                        <h5 className="font-medium text-card-foreground">{passenger.name}</h5>
                        <p className="text-xs text-muted-foreground">Select participation level</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => updateDayParticipation(passenger.id, currentDay, "full")}
                          className={`py-2 px-3 text-sm rounded transition-colors font-medium ${
                            passenger.dailyParticipation[currentDay] === "full"
                              ? "bg-primary text-primary-foreground"
                              : "border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-background"
                          }`}
                        >
                          Full Trip
                        </button>
                        <button
                          onClick={() => updateDayParticipation(passenger.id, currentDay, "one-way")}
                          className={`py-2 px-3 text-sm rounded transition-colors font-medium ${
                            passenger.dailyParticipation[currentDay] === "one-way"
                              ? "bg-secondary text-secondary-foreground"
                              : "border border-secondary/30 text-secondary hover:bg-secondary hover:text-secondary-foreground bg-background"
                          }`}
                        >
                          Half Trip
                        </button>
                        <button
                          onClick={() => updateDayParticipation(passenger.id, currentDay, "none")}
                          className={`py-2 px-3 text-sm rounded transition-colors font-medium ${
                            passenger.dailyParticipation[currentDay] === "none"
                              ? "bg-destructive text-destructive-foreground"
                              : "border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-background"
                          }`}
                        >
                          No Trip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 2: // Results
        return (
          <Card className="shadow-lg border-border w-full">
            <CardHeader className="bg-card">
              <CardTitle className="text-card-foreground">💰 Cost Breakdown</CardTitle>
              <CardDescription>Individual costs based on participation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground font-medium">Daily Cost</p>
                  <p className="text-xl font-bold text-card-foreground">Rs{dailyPrice}</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-foreground font-medium">Total Cost</p>
                  <p className="text-xl font-bold text-foreground">Rs{costs.totalCostAllDays}</p>
                </div>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">
                  📅 Duration: {numberOfDays} day{numberOfDays !== 1 ? "s" : ""}
                </span>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-card-foreground text-base">Individual Total Costs</h4>
                <div className="space-y-3">
                  {passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-card to-accent/5 border border-border"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-card-foreground text-base">{passenger.name}</span>
                      </div>
                      <span className="font-bold text-lg text-card-foreground">
                        Rs{costs.passengerTotalCosts[passenger.id]?.toFixed(0) || "0"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                <p>
                  💡 <strong>How it works:</strong>
                </p>
                <p>• Each day is calculated separately based on who participates</p>
                <p>
                  • <span className="text-primary">Full trip:</span> Share remaining cost after one-way deductions
                </p>
                <p>
                  • <span className="text-secondary">Half trip:</span> Pay proportional half share for that day
                </p>
                <p>
                  • <span className="text-destructive">No trip:</span> No cost for that day
                </p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const renderSettingsModal = () => {
    if (!showSettings) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="shadow-lg border-border w-full max-w-md max-h-[80vh] overflow-y-auto">
          <CardHeader className="bg-card">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">⚙️ Passenger Settings</CardTitle>
                <CardDescription>Manage passengers for your carpool</CardDescription>
              </div>
              <Button onClick={() => setShowSettings(false)} variant="outline" size="sm" className="h-8 w-8 p-0">
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Passengers ({passengers.length})</Label>
              <Button
                onClick={addPassenger}
                size="sm"
                variant="outline"
                className="text-primary border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground"
              >
                + Add Passenger
              </Button>
            </div>

            <div className="space-y-3">
              {passengers.map((passenger, index) => (
                <div key={passenger.id} className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={passenger.name}
                      onChange={(e) => updatePassengerName(passenger.id, e.target.value)}
                      className="mt-1 bg-background"
                      placeholder="Passenger name"
                    />
                  </div>
                  {index > 0 && (
                    <button
                      onClick={() => removePassenger(passenger.id)}
                      className="px-3 py-2 text-sm bg-background border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-accent/10 p-4">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center space-y-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl font-bold text-foreground text-balance">🚗 Carpool Calculator</h1>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm text-pretty">
            Calculate fair cost sharing for your carpool trips
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-card-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">{steps[currentStep]}</div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {renderStepContent()}
        {renderSettingsModal()}

        <div className="flex justify-between gap-4 pt-4">
          <Button
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            variant="outline"
            className="flex-1 text-primary border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={goToNextStep}
            disabled={currentStep === steps.length - 1}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
