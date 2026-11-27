import React from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Code2,
  Coffee,
  Compass,
  Cpu,
  Globe,
  Layers,
  Lock,
  Mail,
  MapPin,
  Palette,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

export interface IconEntry {
  id: string;
  label: string;
  category: 'Umum' | 'Bisnis' | 'Teknologi' | 'Aksi';
  Component: React.FC<{ className?: string }>;
}

export const ICON_CATALOG: IconEntry[] = [
  { id: 'layers', label: 'Lapisan', category: 'Umum', Component: Layers },
  { id: 'compass', label: 'Kompas', category: 'Umum', Component: Compass },
  { id: 'sparkles', label: 'Kilau', category: 'Umum', Component: Sparkles },
  { id: 'star', label: 'Bintang', category: 'Umum', Component: Star },
  { id: 'award', label: 'Penghargaan', category: 'Umum', Component: Award },
  { id: 'check-circle', label: 'Centang', category: 'Umum', Component: CheckCircle2 },
  { id: 'briefcase', label: 'Portofolio', category: 'Bisnis', Component: Briefcase },
  { id: 'building', label: 'Arsitektur', category: 'Bisnis', Component: Building2 },
  { id: 'coffee', label: 'Kuliner', category: 'Bisnis', Component: Coffee },
  { id: 'camera', label: 'Fotografi', category: 'Bisnis', Component: Camera },
  { id: 'clock', label: 'Waktu', category: 'Bisnis', Component: Clock },
  { id: 'map-pin', label: 'Lokasi', category: 'Bisnis', Component: MapPin },
  { id: 'palette', label: 'Desain', category: 'Teknologi', Component: Palette },
  { id: 'code', label: 'Kode', category: 'Teknologi', Component: Code2 },
  { id: 'cpu', label: 'Sistem', category: 'Teknologi', Component: Cpu },
  { id: 'globe', label: 'Web', category: 'Teknologi', Component: Globe },
  { id: 'shield', label: 'Keamanan', category: 'Teknologi', Component: ShieldCheck },
  { id: 'lock', label: 'Privat', category: 'Teknologi', Component: Lock },
  { id: 'zap', label: 'Cepat', category: 'Aksi', Component: Zap },
  { id: 'arrow-right', label: 'Panah', category: 'Aksi', Component: ArrowRight },
  { id: 'send', label: 'Kirim', category: 'Aksi', Component: Send },
  { id: 'calendar', label: 'Jadwal', category: 'Aksi', Component: Calendar },
  { id: 'phone', label: 'Telepon', category: 'Aksi', Component: Phone },
  { id: 'mail', label: 'Email', category: 'Aksi', Component: Mail },
];

export function renderIconById(
  iconId?: string,
  className = 'w-4 h-4'
): React.ReactNode {
  if (!iconId) return null;
  const entry = ICON_CATALOG.find((i) => i.id === iconId);
  if (!entry) return null;
  const IconComp = entry.Component;
  return <IconComp className={className} />;
}
