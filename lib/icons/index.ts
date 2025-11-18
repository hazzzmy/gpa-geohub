// Icon System - Centralized icon exports
// Using lucide-react icons for consistency

export {
  // Navigation
  Home,
  Menu,
  Search,
  Settings,
  User,
  Users,
  LogOut,
  LogIn,
  UserPlus,

  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Share,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,

  // Communication
  Mail,
  Phone,
  MessageCircle,
  Send,

  // Data & Files
  File,
  Folder,
  Database,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,

  // UI Elements
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  MoreVertical,

  // Status
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,

  // Media
  Image,
  Video,
  Camera,
  Mic,
  Volume2,
  VolumeX,

  // Time
  Clock,
  Calendar,
  CalendarDays,

  // Location
  MapPin,
  Navigation,
  Globe,

  // Weather & Environment
  Sun,
  Moon,
  Cloud,
  CloudRain,

  // Social
  Heart,
  ThumbsUp,
  ThumbsDown,
  Star,

  // Technology
  Wifi,
  Bluetooth,
  Battery,
  Zap,

  // Business
  Building,
  Briefcase,
  DollarSign,
  CreditCard,

  // Education
  Book,
  BookOpen,
  GraduationCap,
  Lightbulb,

  // Health
  Activity,
  Shield,
  Cross,

  // Transportation
  Car,
  Bike,
  Plane,
  Train,
  Bus,

  // Food & Drink
  Coffee,
  Utensils,
  ShoppingCart,
  Gift,

  // Entertainment
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,

  // Tools
  Wrench,
  Hammer,
  Ruler,

  // Security
  Lock,
  Unlock,
  Key,

  // Communication
  MessageSquare,
  PhoneCall,

  // Development
  Code,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Bug,
  Terminal,

  // Design
  Palette,
  Brush,
  Type,

  // System
  Power,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,

  // Feedback
  Smile,
  Frown,
  Meh,

  // Misc
  HelpCircle,
  ExternalLink,
  Link,
  Unlink,
  Hash,
  AtSign,
  Percent,
  Infinity,
  Target,
  Sparkles,
} from 'lucide-react';

// Icon size variants
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

// Icon color variants
export const iconColors = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
} as const;

// Icon component wrapper for consistent styling
export interface IconProps {
  size?: keyof typeof iconSizes | number;
  color?: keyof typeof iconColors;
  className?: string;
}

// Common icon combinations
export const iconSets = {
  // Navigation set
  navigation: {
    home: 'Home',
    menu: 'Menu',
    search: 'Search',
    settings: 'Settings',
    user: 'User',
  },

  // Actions set
  actions: {
    add: 'Plus',
    edit: 'Edit',
    delete: 'Trash2',
    save: 'Save',
    close: 'X',
    check: 'Check',
  },

  // Status set
  status: {
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'AlertCircle',
    info: 'Info',
  },

  // Direction set
  direction: {
    up: 'ChevronUp',
    down: 'ChevronDown',
    left: 'ChevronLeft',
    right: 'ChevronRight',
  },
} as const;
