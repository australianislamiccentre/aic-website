/**
 * Icon Map
 *
 * Maps Sanity icon picker string names to Lucide React components.
 * Only icons that are actually used on the site are included to keep
 * the bundle lean. Unknown names gracefully return null.
 *
 * @module lib/icon-map
 */
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Calendar,
  Landmark,
  Play,
  MessageCircle,
  Heart,
  ArrowRight,
  Plus,
  Menu,
  X,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Star,
  BookOpen,
  GraduationCap,
  Home,
  Info,
  Settings,
  Globe,
  HandHeart,
  Megaphone,
  Newspaper,
  Camera,
  Download,
  FileText,
  Shield,
  Scale,
  Accessibility,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Landmark,
  Play,
  MessageCircle,
  Heart,
  ArrowRight,
  Plus,
  Menu,
  X,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Star,
  BookOpen,
  GraduationCap,
  Home,
  Info,
  Settings,
  Globe,
  HandHeart,
  Megaphone,
  Newspaper,
  Camera,
  Download,
  FileText,
  Shield,
  Scale,
  Accessibility,
};

/**
 * Look up a Lucide icon by name. Returns the component or null if not found.
 * Supports an optional fallback name.
 */
export function getIcon(name?: string, fallback?: string): LucideIcon | null {
  if (name && iconMap[name]) return iconMap[name];
  if (fallback && iconMap[fallback]) return iconMap[fallback];
  return null;
}
