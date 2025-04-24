import { NextResponse } from "next/server";

// A sample list of 5-letter words
const words = [
  "apple",
  "beach",
  "chair",
  "dance",
  "earth",
  "flame",
  "grape",
  "house",
  "igloo",
  "jelly",
  "knife",
  "lemon",
  "music",
  "night",
  "ocean",
  "piano",
  "queen",
  "river",
  "sunny",
  "table",
  "umbra",
  "voice",
  "water",
  "xenon",
  "yacht",
  "zebra",
];

export async function GET() {
  return NextResponse.json({ words });
}
