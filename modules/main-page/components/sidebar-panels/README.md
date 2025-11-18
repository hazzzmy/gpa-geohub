# Sidebar Panel Components

Custom components untuk sidebar panel di aplikasi Field Portal.

## 📋 Struktur

Sidebar panels adalah komponen React yang ditampilkan di panel kedua sidebar (sebelah kanan ikon navigasi). Setiap panel dapat memiliki UI dan interaksi custom sesuai kebutuhan.

## 🎯 Cara Membuat Panel Baru

### 1. Buat File Komponen

Buat file baru di `modules/main-page/components/sidebar-panels/`:

```tsx
// YourPanel.tsx
"use client";

import React from "react";
import { Icon1, Icon2 } from "lucide-react";

interface YourPanelProps {
  user?: {
    name: string;
    email: string;
  };
  onActionClick?: (actionId: string) => void;
  // Add custom props as needed
  customProp?: string;
}

export function YourPanel({ user, onActionClick, customProp }: YourPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Your custom UI here */}
      <h3 className="font-semibold text-sm">Your Panel Title</h3>
      
      <button
        onClick={() => onActionClick?.("your-action-id")}
        className="p-3 rounded-lg hover:bg-sidebar-accent"
      >
        Click me!
      </button>
    </div>
  );
}
```

### 2. Export di Index

Tambahkan export di `index.ts`:

```tsx
export { DashboardPanel } from "./DashboardPanel";
export { YourPanel } from "./YourPanel"; // Add this
```

### 3. Import di app-sidebar.tsx

```tsx
import { DashboardPanel, YourPanel } from "./sidebar-panels"
```

### 4. Register Panel

Tambahkan ke `defaultData.sidebarPanels` di `app-sidebar.tsx`:

```tsx
sidebarPanels: {
  "Fields Portal": {
    component: DashboardPanel,
    props: {},
  },
  "Your Nav Item": {
    component: YourPanel,
    props: {
      customProp: "some value"
    },
  },
},
```

## 📦 Props yang Tersedia

Setiap panel component akan menerima props berikut secara otomatis:

| Prop | Type | Description |
|------|------|-------------|
| `user` | `{ name: string; email: string; avatar?: string }` | User data saat ini |
| `onActionClick` | `(actionId: string) => void` | Callback untuk trigger action di main content |
| `...custom` | `any` | Custom props yang didefinisikan di config |

## 🎨 Best Practices

### 1. Styling

Gunakan Tailwind classes yang konsisten dengan design system:

```tsx
// Container
<div className="flex flex-col gap-4 p-4">

// Sections dengan border
<div className="border-t pt-3">

// Buttons
<button className="p-3 rounded-lg hover:bg-sidebar-accent transition-colors">

// Text colors
<span className="text-foreground"> // Main text
<span className="text-muted-foreground"> // Secondary text
<span className="text-sidebar-primary"> // Primary accent
```

### 2. Icons

Gunakan `lucide-react` untuk consistency:

```tsx
import { Home, Settings, Database } from "lucide-react";

<Icon className="w-4 h-4 text-sidebar-primary" />
```

### 3. Actions

Trigger actions menggunakan `onActionClick`:

```tsx
<button onClick={() => onActionClick?.("dashboard")}>
  Go to Dashboard
</button>
```

Action IDs yang tersedia:
- `dashboard` - Main dashboard
- `view-map` - Open map view
- `generate-report` - Generate report
- Custom IDs sesuai kebutuhan

### 4. Responsive Design

Panel hanya visible di layar md ke atas (hidden di mobile):

```tsx
// No need to add responsive classes, handled by Sidebar component
<div className="flex flex-col gap-4 p-4">
  {/* Your content */}
</div>
```

## 💡 Contoh Use Cases

### Dashboard Panel
Menampilkan stats, quick actions, system status

### Map Panel
Layer controls, legend, search

### Data Panel
Recent uploads, dataset browser, filters

### Settings Panel
Quick settings, preferences, shortcuts

### Analytics Panel
Charts, metrics, export options

## 🔧 Advanced Features

### State Management

```tsx
export function YourPanel({ user, onActionClick }: YourPanelProps) {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Fetch data
    fetchData().then(setData);
  }, []);
  
  return (
    <div className="p-4">
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### API Integration

```tsx
import { useQuery } from '@tanstack/react-query';

export function YourPanel({ user }: YourPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['your-data'],
    queryFn: fetchYourData,
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Render data */}</div>;
}
```

### Conditional Rendering

```tsx
export function YourPanel({ user, onActionClick }: YourPanelProps) {
  const hasPermission = user?.permissions?.includes('admin');
  
  return (
    <div className="p-4">
      {hasPermission && (
        <button onClick={() => onActionClick?.('admin-action')}>
          Admin Action
        </button>
      )}
    </div>
  );
}
```

## 🚀 Tips

1. **Keep it simple**: Panel harus fokus dan tidak terlalu complex
2. **Performance**: Lazy load data jika perlu
3. **Accessibility**: Gunakan semantic HTML dan ARIA labels
4. **Loading states**: Always show loading indicators
5. **Error handling**: Handle errors gracefully
6. **Dark mode**: Test di light dan dark mode

## 📚 Component Library

Gunakan komponen dari `@/components/ui`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function YourPanel() {
  return (
    <div className="p-4">
      <Card>
        <CardContent className="p-3">
          <Badge>New</Badge>
          <Separator className="my-2" />
          <Button size="sm">Action</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

Happy coding! 🎉


