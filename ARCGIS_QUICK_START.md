# ArcGIS Enterprise - Quick Start Guide 🚀

Panduan cepat untuk setup ArcGIS Enterprise authentication di aplikasi Field Portal.

## ⚡ Setup dalam 5 Menit

### 1. Tambahkan Credentials ke `.env`

```env
# ArcGIS Enterprise Configuration
ARCGIS_PORTAL_URL="https://your-portal.com/portal"
ARCGIS_USERNAME="your-username"
ARCGIS_PASSWORD="your-password"
ARCGIS_REFERER="http://localhost:3000"

# Optional: Map Service URL
ARCGIS_MAP_SERVICE_URL="https://your-server.com/arcgis/rest/services/YourMap/MapServer"
```

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Test Token Generation

Buka browser dan akses:
```
http://localhost:3000/api/arcgis/token
```

Anda akan mendapat response seperti ini:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJI...",
  "expires": 1697123456789,
  "expiresAt": "2024-10-12T15:30:56.789Z"
}
```

✅ **Selesai!** Token ArcGIS Enterprise Anda sudah aktif.

---

## 🗺️ Menggunakan di Map Component

Map component (`components/map/ArcGISMap.tsx`) sudah ter-integrasi otomatis dengan authentication.

### Features yang Sudah Tersedia:

- ✅ Auto-fetch token saat map load
- ✅ Auto-refresh token sebelum expired
- ✅ Loading state dengan spinner
- ✅ Error handling dengan UI yang informatif
- ✅ Google Satellite sebagai basemap default

---

## 📦 Menambahkan Layer dari ArcGIS Enterprise

Edit `components/map/ArcGISMap.tsx` dan tambahkan layer Anda:

```typescript
// Import layer yang dibutuhkan
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

// Di dalam useEffect, setelah membuat map:
const myLayer = new FeatureLayer({
  url: process.env.NEXT_PUBLIC_ARCGIS_MAP_SERVICE_URL + "/0",
  outFields: ["*"],
  title: "My Data Layer"
});

map.add(myLayer);
```

---

## 🔑 API Endpoints yang Tersedia

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/arcgis/token` | GET | Get valid token (auto-cached) |
| `/api/arcgis/token` | POST | Force refresh token |
| `/api/arcgis/token` | DELETE | Clear token cache |

---

## 🎯 Menggunakan Hook di Component Lain

```typescript
import { useArcGISToken } from '@/hooks';

function MyComponent() {
  const { token, isLoading, error } = useArcGISToken();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Token: {token}</div>;
}
```

---

## ⚠️ Troubleshooting

### "Missing ArcGIS Enterprise credentials"
- ✅ Pastikan `.env` file exists
- ✅ Cek semua variable terisi
- ✅ Restart server: `npm run dev`

### "401 Unauthorized" atau "Invalid credentials"
- ✅ Verifikasi username dan password benar
- ✅ Test login ke Portal langsung via browser
- ✅ Hubungi ArcGIS administrator

### "CORS Error"
- ✅ Tambahkan `http://localhost:3000` ke ArcGIS Portal CORS settings
- ✅ Di production, tambahkan domain production Anda

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi detail, lihat: [ARCGIS_ENTERPRISE_SETUP.md](./ARCGIS_ENTERPRISE_SETUP.md)

---

## ✨ What's Next?

1. **Tambahkan Layer Data Anda**: Edit `ArcGISMap.tsx` dan tambahkan FeatureLayer atau MapImageLayer
2. **Customize Basemap**: Ganti Google Satellite dengan basemap ArcGIS Enterprise Anda
3. **Add Widgets**: Tambahkan Legend, LayerList, Search, dll
4. **Implement Queries**: Query feature layers dengan esri Query
5. **Add Editing**: Enable feature editing untuk field data collection

---

Happy Mapping! 🗺️✨


