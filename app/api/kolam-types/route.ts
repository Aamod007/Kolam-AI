// Kolam types API route
import { NextResponse } from 'next/server';

const kolamTypes = [
	"Pulli Kolam (Dot-Based Kolam)",
	"Sikku Kolam (Chikku or Knot Kolam)",
	"Kambi Kolam (Line or Wire-Like Kolam)",
	"Neli Kolam (Curvy or Slithering Kolam)",
	"Kodu Kolam (Tessellated Kolam)",
	"Padi Kolam (Manai Kolam or Step Kolam)",
	"Idukku Pulli Kolam (Oodu Pulli or Idai Pulli)",
	"Kanya Kolam",
	"Freehand Kolam",
	"Maa Kolam (Wet Flour Kolam)",
	"Kavi/Semman Kolam",
	"Poo Kolam (Pookolam or Flower Kolam)",
	"Nalvaravu Kolam (Welcoming Kolam)",
	"Thottil Kolam (Cradle Kolam)",
	"Ratha Kolam (Chariot Kolam)",
	"Navagraha Kolam (Nine Planets Kolam)",
	"Swastika Kolam",
	"Star Kolam (Nakshatra Kolam)",
	"Kottu Kolam (Box or Compartment Kolam)",
	"Vinayagar Kolam (Ganesha Kolam)",
	"Pavitra Kolam (Sacred Thread Kolam)",
	"Muggu (Andhra Pradesh/Telangana Kolam)",
	"Alpona (Bengali Floor Art)",
	"Chowkpurana (Maharashtrian Rangoli)",
	"Aripana (Bihari Floor Art)",
	"Mandana (Rajasthan Variant)",
	"Aipan (Uttarakhand Ritual Art)",
	"Jhoti or Chita (Odisha Floor Art)",
	"Sathiya (Gujarat Swastika-Based)",
	"Murja (Odisha Tulsi Art)",
	"Hase (Karnataka Rangoli)",
	"Mandala Kolam",
	"Celtic Knot Kolam",
	"Musical Kolam",
	"3D Kolam",
	"Kolam with Numbers or Letters",
	"Eco-Friendly Kolam",
	"Digital Kolam",
	"Other"
];

export async function GET() {
	return NextResponse.json({ kolamTypes });
}
