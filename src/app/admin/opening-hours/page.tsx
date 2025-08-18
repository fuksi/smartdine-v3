"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, Clock } from "lucide-react";

interface OpeningHour {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function OpeningHoursPage() {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationId, setLocationId] = useState<string>("");

  useEffect(() => {
    // First fetch the location
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      // For demo purposes, get the first active location
      const response = await fetch("/api/admin/locations");
      if (response.ok) {
        const locations = await response.json();
        if (locations.length > 0) {
          setLocationId(locations[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const fetchOpeningHours = useCallback(async () => {
    if (!locationId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/opening-hours?locationId=${locationId}`
      );
      const data = await response.json();
      setOpeningHours(data);
    } catch (error) {
      console.error("Error fetching opening hours:", error);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    if (locationId) {
      fetchOpeningHours();
    }
  }, [locationId, fetchOpeningHours]);

  const updateOpeningHour = (
    dayOfWeek: number,
    updates: Partial<OpeningHour>
  ) => {
    setOpeningHours((hours) =>
      hours.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, ...updates } : hour
      )
    );
  };

  const toggleDay = (dayOfWeek: number, isOpen: boolean) => {
    updateOpeningHour(dayOfWeek, {
      isOpen,
      openTime: isOpen
        ? openingHours.find((h) => h.dayOfWeek === dayOfWeek)?.openTime ||
          "10:00"
        : null,
      closeTime: isOpen
        ? openingHours.find((h) => h.dayOfWeek === dayOfWeek)?.closeTime ||
          "19:00"
        : null,
    });
  };

  const updateTime = (
    dayOfWeek: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    updateOpeningHour(dayOfWeek, { [field]: value });
  };

  const saveOpeningHours = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          openingHours,
        }),
      });

      if (response.ok) {
        alert("Opening hours saved successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save opening hours");
      }
    } catch (error) {
      console.error("Error saving opening hours:", error);
      alert("Failed to save opening hours");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Opening Hours</h1>
        <p className="text-muted-foreground">
          Manage your restaurant&apos;s opening hours for each day of the week.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle>Weekly Schedule</CardTitle>
            </div>
            <Button
              onClick={saveOpeningHours}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((dayName, index) => {
            const hour = openingHours.find((h) => h.dayOfWeek === index);
            const isOpen = hour?.isOpen || false;
            const openTime = hour?.openTime || "10:00";
            const closeTime = hour?.closeTime || "19:00";

            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 font-medium text-sm">{dayName}</div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isOpen}
                        onCheckedChange={(checked: boolean) =>
                          toggleDay(index, checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-sm text-gray-600">
                        {isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">
                          Opening Time
                        </label>
                        <Input
                          type="time"
                          value={openTime}
                          onChange={(e) =>
                            updateTime(index, "openTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">
                          Closing Time
                        </label>
                        <Input
                          type="time"
                          value={closeTime}
                          onChange={(e) =>
                            updateTime(index, "closeTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
