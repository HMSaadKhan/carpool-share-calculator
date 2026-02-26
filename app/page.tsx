"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Car,
  Zap,
  Wallet,
  MapPin,
  Fuel,
  Info,
  Copy,
  Plus,
  Trash2,
  Trophy,
  Share2
} from "lucide-react"

interface Passenger {
  id: number
  name: string
  dailyParticipation: ("full" | "one-way" | "none")[]
}

type Mode = "commute" | "roadtrip"

export default function CarpoolCalculator() {
  // State
  const [currentStep, setCurrentStep] = useState<number>(0)
  const steps = ["Setup", "Daily Participation", "Results"]
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [mode, setMode] = useState<Mode>("commute")

  // Commute Mode State
  const [dailyPrice, setDailyPrice] = useState<number>(2000)
  const [numberOfDays, setNumberOfDays] = useState<number>(5)
  const [currentDay, setCurrentDay] = useState<number>(0)

  // Road Trip Mode State
  const [distance, setDistance] = useState<number>(200)
  const [efficiency, setEfficiency] = useState<number>(15)
  const [fuelPrice, setFuelPrice] = useState<number>(270)

  // Common Fees
  const [tolls, setTolls] = useState<number>(0)
  const [parking, setParking] = useState<number>(0)

  // Passengers
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, name: "Car Owner", dailyParticipation: Array(5).fill("full") },
    { id: 2, name: "Passenger 1", dailyParticipation: Array(5).fill("full") },
    { id: 3, name: "Passenger 2", dailyParticipation: Array(5).fill("full") },
  ])

  // Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem("carpoolData")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.passengers) setPassengers(parsed.passengers)
        if (parsed.dailyPrice) setDailyPrice(parsed.dailyPrice)
        if (parsed.numberOfDays) setNumberOfDays(parsed.numberOfDays)
        if (parsed.mode) setMode(parsed.mode)
        if (parsed.distance) setDistance(parsed.distance)
        if (parsed.efficiency) setEfficiency(parsed.efficiency)
        if (parsed.fuelPrice) setFuelPrice(parsed.fuelPrice)
        if (parsed.tolls) setTolls(parsed.tolls)
        if (parsed.parking) setParking(parsed.parking)
      } catch (error) {
        console.log("Error loading saved data:", error)
      }
    }
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    const dataToSave = {
      passengers,
      dailyPrice,
      numberOfDays,
      mode,
      distance,
      efficiency,
      fuelPrice,
      tolls,
      parking
    }
    localStorage.setItem("carpoolData", JSON.stringify(dataToSave))
  }, [passengers, dailyPrice, numberOfDays, mode, distance, efficiency, fuelPrice, tolls, parking])

  // Helpers
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
    const newId = passengers.length > 0 ? Math.max(...passengers.map((p) => p.id)) + 1 : 1
    const partsCount = mode === "commute" ? numberOfDays : 1
    setPassengers([
      ...passengers,
      {
        id: newId,
        name: `Passenger ${newId}`,
        dailyParticipation: Array(partsCount).fill("full"),
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
    let totalFuelCost = 0
    const passengerTotalCosts: Record<number, number> = {}

    passengers.forEach((p) => (passengerTotalCosts[p.id] = 0))

    if (mode === "commute") {
      for (let i = 0; i < numberOfDays; i++) {
        const fullTripP = passengers.filter((p) => p.dailyParticipation[i] === "full")
        const oneWayP = passengers.filter((p) => p.dailyParticipation[i] === "one-way")
        const activeP = passengers.filter((p) => p.dailyParticipation[i] !== "none")

        if (activeP.length === 0) continue

        const oneWayCost = dailyPrice / (activeP.length * 2)
        const totalOneWay = oneWayP.length * oneWayCost
        const remaining = dailyPrice - totalOneWay
        const fullTripCost = fullTripP.length > 0 ? remaining / fullTripP.length : 0

        fullTripP.forEach((p) => (passengerTotalCosts[p.id] += fullTripCost))
        oneWayP.forEach((p) => (passengerTotalCosts[p.id] += oneWayCost))
        totalFuelCost += dailyPrice
      }
    } else {
      // Road Trip
      totalFuelCost = (distance / efficiency) * fuelPrice
      const tripCost = totalFuelCost
      const fullTripP = passengers.filter((p) => p.dailyParticipation[0] === "full")
      const oneWayP = passengers.filter((p) => p.dailyParticipation[0] === "one-way")
      const activeP = passengers.filter((p) => p.dailyParticipation[0] !== "none")

      if (activeP.length > 0) {
        const oneWayCost = tripCost / (activeP.length * 2)
        const totalOneWay = oneWayP.length * oneWayCost
        const remaining = tripCost - totalOneWay
        const fullTripCost = fullTripP.length > 0 ? remaining / fullTripP.length : 0

        fullTripP.forEach((p) => (passengerTotalCosts[p.id] += fullTripCost))
        oneWayP.forEach((p) => (passengerTotalCosts[p.id] += oneWayCost))
      }
    }

    // Add extra fees equally among ALL active passengers (any trip)
    const allActiveUnique = passengers.filter(p => p.dailyParticipation.some(pt => pt !== "none"))
    if (allActiveUnique.length > 0) {
      const extraPerPerson = (tolls + parking) / allActiveUnique.length
      allActiveUnique.forEach(p => (passengerTotalCosts[p.id] += extraPerPerson))
    }

    return {
      passengerTotalCosts,
      totalFuelCost,
      totalTripCost: totalFuelCost + tolls + parking,
    }
  }

  const costs = calculateCosts()

  const copyResults = () => {
    let text = `🚗 Carpool Cost Summary (${mode === 'commute' ? 'Commute' : 'Road Trip'})\n`
    text += `--------------------------------\n`
    text += `Total Trip Cost: Rs ${costs.totalTripCost.toFixed(0)}\n`
    if (mode === 'commute') text += `Days: ${numberOfDays}\n`
    else text += `Distance: ${distance} km\n`
    text += `Tolls & Parking: Rs ${tolls + parking}\n`
    text += `--------------------------------\n`
    passengers.forEach(p => {
      text += `${p.name}: Rs ${costs.passengerTotalCosts[p.id].toFixed(0)}\n`
    })
    text += `--------------------------------\n`
    text += `Generated via TinkerHub Carpool Calculator`

    navigator.clipboard.writeText(text)
    alert("Results copied to clipboard!")
  }

  // Render Helpers
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="glass-card border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Trip Configuration</CardTitle>
                    <CardDescription>Select mode and set core expenses</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl">
                  <button
                    onClick={() => setMode("commute")}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${mode === "commute"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Office Commute
                  </button>
                  <button
                    onClick={() => setMode("roadtrip")}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${mode === "roadtrip"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Long Road Trip
                  </button>
                </div>

                {mode === "commute" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Daily Fuel Cost (Rs)</Label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={dailyPrice}
                          onChange={(e) => setDailyPrice(Number(e.target.value))}
                          className="pl-10 h-11 bg-background/50 border-border/50 focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Number of Days</Label>
                      <div className="relative">
                        <Zap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={numberOfDays}
                          onChange={(e) => setNumberOfDays(Number(e.target.value))}
                          className="pl-10 h-11 bg-background/50 border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider font-bold">Distance (Km)</Label>
                        <Input
                          type="number"
                          value={distance}
                          onChange={e => setDistance(Number(e.target.value))}
                          className="h-11 bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider font-bold">Mileage (Km/L)</Label>
                        <Input
                          type="number"
                          value={efficiency}
                          onChange={e => setEfficiency(Number(e.target.value))}
                          className="h-11 bg-background/50 border-border/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold">Fuel Price (Rs/Litre)</Label>
                      <Input
                        type="number"
                        value={fuelPrice}
                        onChange={e => setFuelPrice(Number(e.target.value))}
                        className="h-11 bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                )}

                <Separator className="bg-border/30" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold">Tolls (Rs)</Label>
                    <Input
                      type="number"
                      value={tolls}
                      onChange={e => setTolls(Number(e.target.value))}
                      className="h-11 bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold">Parking (Rs)</Label>
                    <Input
                      type="number"
                      value={parking}
                      onChange={e => setParking(Number(e.target.value))}
                      className="h-11 bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="glass-card border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Attendance</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="hover:bg-emerald-500/10">
                    <Plus className="w-4 h-4 mr-2" /> Members
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mode === "commute" && (
                  <div className="flex items-center justify-between mb-8 p-3 bg-muted/30 rounded-2xl border border-border/50">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDay(Math.max(0, currentDay - 1))} disabled={currentDay === 0}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground uppercase tracking-tighter font-bold">Day {currentDay + 1}</span>
                      <p className="text-xs text-emerald-400 font-medium">Split Rs {dailyPrice}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDay(Math.min(numberOfDays - 1, currentDay + 1))} disabled={currentDay === numberOfDays - 1}>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {passengers.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-muted/40 border border-border/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm">{p.name}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground py-0.5 px-2 bg-muted rounded-full">
                          {p.dailyParticipation[mode === 'commute' ? currentDay : 0]}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {["full", "one-way", "none"].map((type) => (
                          <button
                            key={type}
                            onClick={() => updateDayParticipation(p.id, mode === 'commute' ? currentDay : 0, type as any)}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${p.dailyParticipation[mode === 'commute' ? currentDay : 0] === type
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-background/40 border-border/50 hover:border-emerald-500/50"
                              }`}
                          >
                            {type.replace('-', ' ').toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Card className="glass-card border-emerald-500/20 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-sm text-muted-foreground uppercase tracking-[0.2em]">Summary</CardTitle>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">Total Expenditure</span>
                  <p className="text-4xl font-black gradient-text">Rs {costs.totalTripCost.toFixed(0)}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Fuel</span>
                    <p className="text-lg font-bold">Rs {costs.totalFuelCost.toFixed(0)}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Fees</span>
                    <p className="text-lg font-bold">Rs {tolls + parking}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Individual Shares</Label>
                  <div className="space-y-3">
                    {passengers.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-background/30 rounded-2xl border border-border/30 hover-lift">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                            {p.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black">Rs {costs.passengerTotalCosts[p.id].toFixed(0)}</p>
                          <span className="text-[10px] text-muted-foreground">Incl. Rs {((tolls + parking) / passengers.filter(p => p.dailyParticipation.some(pt => pt !== 'none')).length).toFixed(0)} fees</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={copyResults} className="flex-1 rounded-xl h-12 bg-primary hover:bg-emerald-600 font-bold">
                    <Copy className="w-4 h-4 mr-2" /> Copy results
                  </Button>
                  <Button variant="outline" className="rounded-xl h-12 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none bg-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 text-xs leading-relaxed text-muted-foreground">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground mb-1">How it's calculated:</p>
                    <p>Fees are split equally among all participants. Half trips contribute exactly 50% of a full person's fuel share for that specific leg.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30">
      <div className="max-w-lg mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex p-3 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-emerald-400 mb-2">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">
            Carpool <span className="gradient-text">Share</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-[280px] mx-auto">
            Dynamic cost-splitting for modern travel groups. Fast, fair, and precise.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10 space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{steps[currentStep]}</span>
            <span className="text-[10px] font-black text-muted-foreground">{currentStep + 1} / {steps.length}</span>
          </div>
          <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {renderStepContent()}

        {/* Footer Nav */}
        <div className="mt-10 flex gap-4">
          <Button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            variant="outline"
            className="flex-1 h-14 rounded-2xl border-border/50 text-muted-foreground hover:bg-accent/5 hover:text-foreground transition-all font-bold"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </Button>
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={currentStep === steps.length - 1}
            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all hover-lift font-black tracking-wide"
          >
            {currentStep === 1 ? "Results" : "Next"} <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* Branding Footer */}
        <div className="mt-20 text-center opacity-30 select-none pointer-events-none">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Powered by TinkerHub</p>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 transition-all duration-300">
            <Card className="w-full max-w-sm glass-card border-none shadow-2xl animate-in zoom-in-95 duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Members</CardTitle>
                  <CardDescription>Manage your group</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} className="rounded-full">
                  <Plus className="w-5 h-5 rotate-45" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                  {passengers.map((p, idx) => (
                    <div key={p.id} className="flex gap-2 items-center bg-muted/30 p-2 rounded-2xl border border-border/30">
                      <Input
                        value={p.name}
                        onChange={e => updatePassengerName(p.id, e.target.value)}
                        className="bg-transparent border-none focus-visible:ring-0 font-bold h-10"
                      />
                      {idx > 0 && (
                        <Button variant="ghost" size="icon" onClick={() => removePassenger(p.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={addPassenger} variant="outline" className="w-full h-12 rounded-2xl border-emerald-500/20 text-emerald-400 font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Add Passenger
                </Button>
                <Separator className="bg-border/30" />
                <Button onClick={() => setShowSettings(false)} className="w-full h-12 rounded-2xl bg-foreground text-background font-black">
                  Done
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
