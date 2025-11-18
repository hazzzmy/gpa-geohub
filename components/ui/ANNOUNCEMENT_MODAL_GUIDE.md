# Announcement Modal Guide

Modal announcement yang muncul pertama kali saat user mengakses halaman `/main` di aplikasi Farm Profiling Portal.

## 🎯 Fitur

- ✅ **First Visit Only** - Hanya muncul saat pertama kali mengunjungi halaman
- ✅ **Responsive Design** - Optimal di desktop, tablet, dan mobile
- ✅ **Smooth Animations** - Transisi yang halus dan menarik
- ✅ **Keyboard Navigation** - Support ESC key untuk menutup
- ✅ **Accessibility** - ARIA labels dan focus management
- ✅ **localStorage Integration** - Mengingat preferensi user
- ✅ **Modern UI** - Desain yang clean dan professional

## 🚀 Cara Menggunakan

### 1. Automatic Integration

Modal sudah terintegrasi otomatis di `MainAppLayout.tsx`:

```tsx
import { AnnouncementModal, useAnnouncementModal } from '@/components/ui/announcement-modal';

// Di dalam component
const announcementModal = useAnnouncementModal();

// Di JSX
<AnnouncementModal
  isOpen={announcementModal.isOpen}
  onClose={announcementModal.onClose}
  onDontShowAgain={announcementModal.onDontShowAgain}
/>
```

### 2. Manual Usage

```tsx
import { AnnouncementModal } from '@/components/ui/announcement-modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Show Announcement
      </Button>
      
      <AnnouncementModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDontShowAgain={() => {
          localStorage.setItem('farm-profiling-announcement-seen', 'true');
          setIsOpen(false);
        }}
      />
    </>
  );
}
```

## 🎨 Customization

### 1. Mengubah Konten

Edit file `components/ui/announcement-modal.tsx`:

```tsx
const features = [
  {
    icon: TreePine,
    title: "Your Feature",
    description: "Your description",
    color: "text-green-600 dark:text-green-400",
  },
  // ... tambahkan features lain
];
```

### 2. Mengubah Styling

```tsx
// Ubah warna primary
<div className="p-2 bg-primary/10 rounded-lg">
  <Sparkles className="w-6 h-6 text-primary" />
</div>

// Ubah ukuran modal
<div className="relative z-10 w-full max-w-3xl mx-4">
  {/* content */}
</div>
```

### 3. Mengubah Animasi

```tsx
// Ubah durasi animasi
className={cn(
  "transform transition-all duration-500", // ubah dari 300 ke 500
  isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
)}
```

## 🔧 Configuration

### 1. localStorage Key

```tsx
// Di useAnnouncementModal hook
const hasSeenAnnouncement = localStorage.getItem('farm-profiling-announcement-seen');
```

### 2. Delay Timing

```tsx
// Ubah delay sebelum modal muncul
const timer = setTimeout(() => {
  setIsOpen(true);
}, 2000); // ubah dari 1000 ke 2000ms
```

### 3. Auto-close Timer

```tsx
// Tambahkan auto-close setelah beberapa detik
useEffect(() => {
  if (isOpen) {
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 10000); // auto-close setelah 10 detik
    
    return () => clearTimeout(autoCloseTimer);
  }
}, [isOpen, onClose]);
```

## 📱 Responsive Design

### Desktop (1024px+)
- Modal width: `max-w-2xl`
- Grid: `md:grid-cols-2`
- Buttons: `sm:flex-row`

### Tablet (768px - 1023px)
- Modal width: `max-w-xl`
- Grid: `grid-cols-1`
- Buttons: `flex-col`

### Mobile (< 768px)
- Modal width: `w-full mx-4`
- Grid: `grid-cols-1`
- Buttons: `flex-col`
- Padding: `p-4`

## ♿ Accessibility Features

### 1. Keyboard Navigation
- **ESC**: Menutup modal
- **Tab**: Navigasi antar elemen
- **Enter/Space**: Aktifkan button

### 2. ARIA Labels
```tsx
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="announcement-title"
>
  <h2 id="announcement-title">Welcome to Farm Profiling Portal</h2>
</div>
```

### 3. Focus Management
- Auto-focus ke modal saat dibuka
- Trap focus di dalam modal
- Return focus ke trigger saat ditutup

## 🎭 Animation Details

### 1. Backdrop Animation
```css
.backdrop {
  transition: opacity 0.3s ease;
  opacity: 0 → 1;
}
```

### 2. Modal Animation
```css
.modal {
  transition: all 0.3s ease;
  transform: scale(0.95) → scale(1);
  opacity: 0 → 1;
}
```

### 3. Content Animation
```css
.feature-card {
  transition: background-color 0.2s ease;
  hover: bg-muted/30 → bg-muted/50;
}
```

## 🐛 Troubleshooting

### Modal tidak muncul
```bash
# Check localStorage
localStorage.getItem('farm-profiling-announcement-seen')

# Reset untuk testing
localStorage.removeItem('farm-profiling-announcement-seen')
```

### Animasi tidak smooth
```bash
# Check CSS transitions
# Pastikan browser support CSS transforms
# Check untuk conflicting styles
```

### Mobile layout broken
```bash
# Check viewport meta tag
# Pastikan responsive classes benar
# Test di berbagai ukuran screen
```

## 📊 Performance

### 1. Bundle Size
- Modal component: ~3KB gzipped
- Dependencies: React, Lucide icons
- Total impact: Minimal

### 2. Runtime Performance
- Lazy loading: Modal hanya render saat dibuka
- Memory efficient: Cleanup event listeners
- Smooth 60fps animations

### 3. SEO Impact
- No impact: Modal tidak mempengaruhi SEO
- Client-side only: Tidak ada server-side rendering

## 🔄 State Management

### 1. Modal State
```tsx
const [isOpen, setIsOpen] = useState(false);
const [isVisible, setIsVisible] = useState(false);
```

### 2. localStorage State
```tsx
const hasSeenAnnouncement = localStorage.getItem('farm-profiling-announcement-seen');
```

### 3. Event Listeners
```tsx
// Keyboard events
document.addEventListener('keydown', handleKeyDown);

// Body scroll prevention
document.body.style.overflow = 'hidden';
```

## 🎨 Design System

### 1. Colors
- Primary: `text-primary`
- Muted: `text-muted-foreground`
- Background: `bg-background`
- Border: `border-border`

### 2. Spacing
- Padding: `p-6`, `p-4`, `p-3`
- Margin: `mb-6`, `mt-4`
- Gap: `gap-3`, `gap-4`

### 3. Typography
- Heading: `text-xl font-bold`
- Subtitle: `text-sm text-muted-foreground`
- Body: `text-xs leading-relaxed`

## 📝 Testing

### 1. Manual Testing
```bash
# Test first visit
localStorage.clear()
# Reload page

# Test "Don't show again"
# Click "Don't Show Again"
# Reload page

# Test keyboard navigation
# Press ESC
```

### 2. Automated Testing
```tsx
// Jest test example
test('modal opens on first visit', () => {
  localStorage.clear();
  render(<MainAppLayout />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

## 🚀 Future Enhancements

### 1. Analytics Integration
```tsx
// Track modal interactions
const trackModalEvent = (event: string) => {
  analytics.track('announcement_modal', { event });
};
```

### 2. A/B Testing
```tsx
// Different modal versions
const modalVersion = getABTestVariant('announcement_modal');
```

### 3. Dynamic Content
```tsx
// Load content from API
const { data: announcementContent } = useQuery({
  queryKey: ['announcement'],
  queryFn: fetchAnnouncementContent,
});
```

---

## 📞 Support

Untuk pertanyaan atau issues terkait announcement modal:

1. Check console untuk errors
2. Verify localStorage settings
3. Test di berbagai browser
4. Check responsive design
5. Verify accessibility features

Happy coding! 🎉


