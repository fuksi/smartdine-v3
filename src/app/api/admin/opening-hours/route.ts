import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Get opening hours for a location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 }
      );
    }

    const openingHours = await prisma.openingHour.findMany({
      where: { locationId },
      orderBy: { dayOfWeek: "asc" },
    });

    // If no opening hours exist, create default ones (all days open 10:00-19:00)
    if (openingHours.length === 0) {
      const defaultHours = [];
      for (let day = 0; day < 7; day++) {
        const hour = await prisma.openingHour.create({
          data: {
            locationId,
            dayOfWeek: day,
            isOpen: true,
            openTime: "10:00",
            closeTime: "19:00",
          },
        });
        defaultHours.push(hour);
      }
      return NextResponse.json(defaultHours);
    }

    return NextResponse.json(openingHours);
  } catch (error) {
    console.error("Error fetching opening hours:", error);
    return NextResponse.json(
      { error: "Failed to fetch opening hours" },
      { status: 500 }
    );
  }
}

// Update opening hours
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, openingHours } = body;

    if (!locationId || !Array.isArray(openingHours)) {
      return NextResponse.json(
        { error: "locationId and openingHours array are required" },
        { status: 400 }
      );
    }

    // Update each day's opening hours
    const updatedHours = [];
    for (const hour of openingHours) {
      const { dayOfWeek, isOpen, openTime, closeTime } = hour;

      const updatedHour = await prisma.openingHour.upsert({
        where: {
          locationId_dayOfWeek: {
            locationId,
            dayOfWeek,
          },
        },
        update: {
          isOpen,
          openTime: isOpen ? openTime : null,
          closeTime: isOpen ? closeTime : null,
        },
        create: {
          locationId,
          dayOfWeek,
          isOpen,
          openTime: isOpen ? openTime : null,
          closeTime: isOpen ? closeTime : null,
        },
      });

      updatedHours.push(updatedHour);
    }

    return NextResponse.json(updatedHours);
  } catch (error) {
    console.error("Error updating opening hours:", error);
    return NextResponse.json(
      { error: "Failed to update opening hours" },
      { status: 500 }
    );
  }
}
