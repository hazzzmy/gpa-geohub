# Sidebar Panel Components - Quick Guide 🚀

Panduan lengkap untuk menggunakan dan membuat custom sidebar panels di Field Portal.

## 📖 Apa itu Sidebar Panels?

Sidebar panels adalah komponen custom yang ditampilkan di panel kedua (sebelah kanan) dari sidebar aplikasi. Ini menggantikan quick actions list dengan UI yang lebih interaktif dan fungsional.

## ✨ Fitur

- ✅ **Component-based**: Setiap panel adalah React component yang reusable
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Flexible**: Bisa memiliki state, API calls, dan interaksi complex
- ✅ **Responsive**: Otomatis tersembunyi di mobile
- ✅ **Themeable**: Support dark mode otomatis

## 🎯 Panel yang Sudah Tersedia

### 1. DashboardPanel
Dashboard overview dengan stats dan quick actions.

**Features:**
- System statistics (users, layers, reports)
- Quick action buttons
- System status indicator
- Welcome message

### 2. MapPanel
Map layer controls dan management.

**Features:**
- Layer visibility toggle
- Layer search
- Show/Hide all layers
- Quick actions (Add layer, Zoom extent)

## 🚀 Cara Menggunakan

### Toggle Component Mode

Di `MainAppLayout.tsx`, set prop `usePanelComponents`:

```tsx
<AppSidebar
  user={user}
  onQuickActionChange={setActiveQuickAction}
  usePanelComponents={true} // Enable component panels
/>
```

Set `false` untuk kembali ke quick actions list.

### Menambahkan Panel ke Navigation Item

Edit `modules/main-page/components/app-sidebar.tsx`:

```tsx
import { DashboardPanel, MapPanel, YourCustomPanel } from "./sidebar-panels"

const defaultData = {
  // ... other config
  sidebarPanels: {
    "Fields Portal": {
      component: DashboardPanel,
      props: {},
    },
    "Geospatial Data": {
      component: MapPanel,
      props: {},
    },
    "Your Nav Item": {
      component: YourCustomPanel,
      props: {
        customProp: "value"
      },
    },
  },
}
```

## 🛠️ Membuat Panel Baru

### Step 1: Create Component File

Create `modules/main-page/components/sidebar-panels/YourPanel.tsx`:

```tsx
"use client";

import React from "react";
import { Icon } from "lucide-react";

interface YourPanelProps {
  user?: {
    name: string;
    email: string;
  };
  onActionClick?: (actionId: string) => void;
}

export function YourPanel({ user, onActionClick }: YourPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="font-semibold text-sm">Your Panel</h3>
      
      <button
        onClick={() => onActionClick?.("your-action")}
        className="p-3 rounded-lg hover:bg-sidebar-accent"
      >
        Do Something
      </button>
    </div>
  );
}
```

### Step 2: Export Component

Add to `modules/main-page/components/sidebar-panels/index.ts`:

```tsx
export { YourPanel } from "./YourPanel";
```

### Step 3: Register Panel

Import and register in `app-sidebar.tsx`:

```tsx
import { DashboardPanel, MapPanel, YourPanel } from "./sidebar-panels"

// In defaultData.sidebarPanels:
sidebarPanels: {
  "Your Nav Item": {
    component: YourPanel,
    props: {},
  },
}
```

### Step 4: Add Navigation Item

Add to `defaultData.navMain`:

```tsx
navMain: [
  // ... existing items
  {
    title: "Your Nav Item",
    url: "/main?action=your-action",
    icon: YourIcon,
    isActive: false,
  },
]
```

## 📦 Available Props

Setiap panel automatically receives:

```tsx
interface BasePanelProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onActionClick?: (actionId: string) => void;
  // Plus any custom props from config
}
```

## 🎨 Design Patterns

### Stats Display

```tsx
export function YourPanel() {
  const stats = [
    { label: "Count", value: "42", icon: Icon },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, i) => (
          <div key={i} className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border">
            <stat.icon className="w-4 h-4 text-blue-500" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Action Buttons

```tsx
export function YourPanel({ onActionClick }) {
  const actions = [
    { id: "action1", title: "Action 1", icon: Icon1 },
    { id: "action2", title: "Action 2", icon: Icon2 },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick?.(action.id)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent border"
          >
            <action.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### List with Toggle

```tsx
export function YourPanel() {
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", enabled: true },
    { id: 2, name: "Item 2", enabled: false },
  ]);

  const toggle = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <div className="p-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
          <span className="text-sm">{item.name}</span>
          <Switch checked={item.enabled} onCheckedChange={() => toggle(item.id)} />
        </div>
      ))}
    </div>
  );
}
```

### Search + Filter

```tsx
export function YourPanel() {
  const [search, setSearch] = useState("");
  
  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {/* Filtered results */}
    </div>
  );
}
```

## 🔧 Advanced Usage

### With React Query

```tsx
import { useQuery } from '@tanstack/react-query';

export function YourPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['your-data'],
    queryFn: async () => {
      const res = await fetch('/api/your-endpoint');
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return <div className="p-4">{/* Render data */}</div>;
}
```

### With State Management

```tsx
import { useStore } from '@/lib/stores';

export function YourPanel() {
  const { state, setState } = useStore();
  
  return (
    <div className="p-4">
      <button onClick={() => setState({ ...state, newValue: true })}>
        Update State
      </button>
    </div>
  );
}
```

### With Form

```tsx
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function YourPanel() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
      <Input {...register('name')} placeholder="Name" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## 🎯 Best Practices

1. **Keep it focused**: Each panel should have one clear purpose
2. **Responsive design**: Test on different screen sizes
3. **Loading states**: Always show loading indicators
4. **Error handling**: Handle errors gracefully with UI feedback
5. **Performance**: Use React.memo for expensive renders
6. **Accessibility**: Use semantic HTML and ARIA labels
7. **Dark mode**: Test both themes

## 📚 UI Components Available

From `@/components/ui`:

- `Button` - Buttons with variants
- `Input` - Text inputs
- `Switch` - Toggle switches
- `Card` - Card containers
- `Badge` - Status badges
- `Separator` - Divider lines
- `Select` - Dropdowns
- `Tabs` - Tab navigation

## 💡 Examples Gallery

Check these files for more examples:
- `DashboardPanel.tsx` - Stats and quick actions
- `MapPanel.tsx` - Layer controls and search
- See `README.md` in `sidebar-panels/` for detailed docs

## 🐛 Troubleshooting

### Panel tidak muncul
- ✅ Check `usePanelComponents={true}` di AppSidebar
- ✅ Verify component di-export di index.ts
- ✅ Check sidebarPanels config

### Props tidak ter-pass
- ✅ Check props di sidebarPanels config
- ✅ Verify interface matches props passed

### Styling issues
- ✅ Use Tailwind dark mode classes: `dark:bg-...`
- ✅ Use sidebar color tokens: `bg-sidebar-accent`

---

Happy building! 🎉

For detailed documentation, see: `modules/main-page/components/sidebar-panels/README.md`


