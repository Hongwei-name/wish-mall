<script setup>
import {
  ArrowRight,
  Bell,
  Bot,
  Camera,
  CircleHelp,
  Eye,
  Heart,
  LayoutGrid,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  Undo2,
  Wallet,
  X,
} from '@lucide/vue'

defineProps({ name: { type: String, default: 'grid' } })

// Map business names to the official Lucide Vue icon components.
const icons = {
  grid: LayoutGrid,
  bag: ShoppingBag,
  heart: Heart,
  shield: ShieldCheck,
  pin: MapPin,
  bell: Bell,
  help: CircleHelp,
  chat: MessageSquare,
  bot: Bot,
  camera: Camera,
  arrow: ArrowRight,
  logout: LogOut,
  truck: Truck,
  box: Package,
  pencil: Pencil,
  star: Star,
  return: Undo2,
  wallet: Wallet,
  close: X,
  sparkle: Sparkles,
  phone: Smartphone,
  lock: Lock,
  eye: Eye,
}
</script>

<template>
  <component :is="icons[name] || icons.grid" aria-hidden="true" :size="24" :stroke-width="2" />
</template>
