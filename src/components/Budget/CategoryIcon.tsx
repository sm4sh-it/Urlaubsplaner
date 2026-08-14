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
  FileText,
  Tag,
  Luggage,
  Palmtree,
  MapPin,
  Heart,
  Music,
} from "lucide-react"

export const AVAILABLE_CATEGORY_ICONS = [
  { id: "home", label: "Unterkunft", icon: Home },
  { id: "building", label: "Hotel", icon: Building2 },
  { id: "car", label: "Auto / Fahrt", icon: Car },
  { id: "plane", label: "Flug", icon: Plane },
  { id: "train", label: "Zug / Bahn", icon: Train },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "ship", label: "Schiff / Boot", icon: Ship },
  { id: "fuel", label: "Tanken", icon: Fuel },
  { id: "luggage", label: "Gepäck", icon: Luggage },
  { id: "utensils", label: "Restaurant", icon: Utensils },
  { id: "coffee", label: "Café", icon: Coffee },
  { id: "beer", label: "Bar / Drinks", icon: Beer },
  { id: "wine", label: "Wein / Genuss", icon: Wine },
  { id: "shopping-bag", label: "Shopping", icon: ShoppingBag },
  { id: "shopping-cart", label: "Supermarkt", icon: ShoppingCart },
  { id: "ticket", label: "Tickets / Event", icon: Ticket },
  { id: "camera", label: "Sightseeing", icon: Camera },
  { id: "compass", label: "Tour / Guide", icon: Compass },
  { id: "palmtree", label: "Strand / Urlaub", icon: Palmtree },
  { id: "sun", label: "Sonne / Freizeit", icon: Sun },
  { id: "gift", label: "Souvenirs", icon: Gift },
  { id: "credit-card", label: "Gebühren", icon: CreditCard },
  { id: "wallet", label: "Bargeld", icon: Wallet },
  { id: "file-text", label: "Dokumente / Visa", icon: FileText },
  { id: "map-pin", label: "Ort", icon: MapPin },
  { id: "heart", label: "Wellness", icon: Heart },
  { id: "music", label: "Konzert / Club", icon: Music },
  { id: "sparkles", label: "Besonderes", icon: Sparkles },
  { id: "tag", label: "Allgemein", icon: Tag },
]

interface CategoryIconProps {
  name?: string | null
  className?: string
}

export default function CategoryIcon({ name, className = "w-5 h-5" }: CategoryIconProps) {
  const iconItem = AVAILABLE_CATEGORY_ICONS.find((item) => item.id === name)
  const IconComponent = iconItem ? iconItem.icon : Tag

  return <IconComponent className={className} />
}
