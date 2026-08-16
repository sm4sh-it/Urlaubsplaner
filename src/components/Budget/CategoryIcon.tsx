"use client"

import React from "react"
import {
  Home,
  Building2,
  Car,
  Plane,
  Train,
  Bus,
  Ship,
  Fuel,
  Utensils,
  Coffee,
  Beer,
  Wine,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  Camera,
  Compass,
  Sun,
  Gift,
  Sparkles,
  CreditCard,
  Wallet,
  Coins,
  ArrowRightLeft,
  Scale,
  HandCoins,
  FileText,
  Tag,
  Luggage,
  Palmtree,
  MapPin,
  Music,
  Bath,
} from "lucide-react"

/**
 * Handtuchhalter / Towel Rack Icon im Lucide-Stil für Wellness & Spa
 */
export const TowelRackIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Wandhalterungen oben */}
    <path d="M4 4v3" />
    <path d="M20 4v3" />
    {/* Horizontale Stange */}
    <path d="M3 7h18" />
    {/* Hängendes Handtuch */}
    <path d="M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
    {/* Handtuch-Saumlinie */}
    <path d="M7 15h10" />
  </svg>
)

export interface CategoryIconItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  aliases?: string[]
}

const RAW_CATEGORY_ICONS: CategoryIconItem[] = [
  { id: "tag", label: "Allgemein", icon: Tag },
  { id: "arrow-right-left", label: "Ausgleich / Transfer", icon: ArrowRightLeft },
  { id: "car", label: "Auto / Fahrt", icon: Car },
  { id: "bath", label: "Bad / Entspannung", icon: Bath },
  { id: "beer", label: "Bar / Drinks", icon: Beer },
  { id: "wallet", label: "Bargeld", icon: Wallet },
  { id: "sparkles", label: "Besonderes", icon: Sparkles },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "coffee", label: "Café", icon: Coffee },
  { id: "file-text", label: "Dokumente / Visa", icon: FileText },
  { id: "plane", label: "Flug", icon: Plane },
  { id: "credit-card", label: "Gebühren", icon: CreditCard },
  { id: "luggage", label: "Gepäck", icon: Luggage },
  { id: "building", label: "Hotel", icon: Building2 },
  { id: "music", label: "Konzert / Club", icon: Music },
  { id: "coins", label: "Münzen / Trinkgeld", icon: Coins },
  { id: "map-pin", label: "Ort", icon: MapPin },
  { id: "utensils", label: "Restaurant", icon: Utensils },
  { id: "scale", label: "Saldenausgleich", icon: Scale },
  { id: "ship", label: "Schiff / Boot", icon: Ship },
  { id: "hand-coins", label: "Schuldenausgleich", icon: HandCoins },
  { id: "shopping-bag", label: "Shopping", icon: ShoppingBag },
  { id: "camera", label: "Sightseeing", icon: Camera },
  { id: "sun", label: "Sonne / Freizeit", icon: Sun },
  { id: "gift", label: "Souvenirs", icon: Gift },
  { id: "palmtree", label: "Strand / Urlaub", icon: Palmtree },
  { id: "shopping-cart", label: "Supermarkt", icon: ShoppingCart },
  { id: "fuel", label: "Tanken", icon: Fuel },
  { id: "ticket", label: "Tickets / Event", icon: Ticket },
  { id: "compass", label: "Tour / Guide", icon: Compass },
  { id: "home", label: "Unterkunft", icon: Home },
  { id: "wine", label: "Wein / Genuss", icon: Wine },
  { id: "towel-rack", label: "Wellness", icon: TowelRackIcon, aliases: ["wellness", "heart"] },
  { id: "train", label: "Zug / Bahn", icon: Train },
]

// Alphabetisch nach deutscher Bezeichnung sortiert
export const AVAILABLE_CATEGORY_ICONS = [...RAW_CATEGORY_ICONS].sort((a, b) =>
  a.label.localeCompare(b.label, "de")
)

interface CategoryIconProps {
  name?: string | null
  className?: string
}

export default function CategoryIcon({ name, className = "w-5 h-5" }: CategoryIconProps) {
  const iconItem = AVAILABLE_CATEGORY_ICONS.find(
    (item) => item.id === name || (item.aliases && item.aliases.includes(name || ""))
  )
  const IconComponent = iconItem ? iconItem.icon : Tag

  return <IconComponent className={className} />
}
