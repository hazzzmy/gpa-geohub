# ArcGIS Enterprise Integration Guide

Panduan lengkap untuk mengintegrasikan aplikasi dengan ArcGIS Enterprise menggunakan username dan password authentication.

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Konfigurasi Environment](#konfigurasi-environment)
3. [Cara Kerja Autentikasi](#cara-kerja-autentikasi)
4. [API Endpoints](#api-endpoints)
5. [Penggunaan di Frontend](#penggunaan-di-frontend)
6. [Menambahkan Layer ArcGIS](#menambahkan-layer-arcgis)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- ✅ URL ArcGIS Portal/Enterprise
- ✅ Username dan Password ArcGIS Enterprise
- ✅ Akses ke Map Services yang ingin digunakan
- ✅ Node.js dan npm terinstall

---

## Konfigurasi Environment

### 1. Update File `.env`

Salin konfigurasi dari `env.example` dan update dengan kredensial ArcGIS Enterprise Anda:

```env
# ArcGIS Enterprise Configuration
ARCGIS_PORTAL_URL="https://your-arcgis-portal.com/portal"
ARCGIS_USERNAME="your-arcgis-username"
ARCGIS_PASSWORD="your-arcgis-password"
ARCGIS_REFERER="http://localhost:3000"

# ArcGIS Services (Optional)
ARCGIS_MAP_SERVICE_URL="https://your-arcgis-server.com/arcgis/rest/services/YourMapService/MapServer"
```

### 2. Penjelasan Environment Variables

| Variable | Deskripsi | Required | Contoh |
|----------|-----------|----------|--------|
| `ARCGIS_PORTAL_URL` | URL Portal ArcGIS Enterprise | ✅ Yes | `https://portal.example.com/portal` |
| `ARCGIS_USERNAME` | Username akun ArcGIS | ✅ Yes | `admin` atau `user@example.com` |
| `ARCGIS_PASSWORD` | Password akun ArcGIS | ✅ Yes | `your-secure-password` |
| `ARCGIS_REFERER` | Referer URL untuk token generation | ❌ No | `http://localhost:3000` |
| `ARCGIS_MAP_SERVICE_URL` | URL Map Service spesifik | ❌ No | `https://server.com/arcgis/rest/services/Map/MapServer` |

---

## Cara Kerja Autentikasi

### Token Generation Flow

```
┌─────────────────┐
│  Client Request │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  GET /api/arcgis/token  │
│  (Next.js API Route)    │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Check Token Cache       │
│  (In-memory)             │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │ Valid?  │
    └────┬────┘
         │
    No   │   Yes
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────────┐
│Gen   │  │ Return   │
│Token │  │ Cached   │
└──┬───┘  └──────────┘
   │
   ▼
┌────────────────────────────┐
│ POST to ArcGIS Portal      │
│ /sharing/rest/generateToken│
└────────┬───────────────────┘
         │
         ▼
┌─────────────────────┐
│  Return Token to    │
│  Client             │
└─────────────────────┘
```

### Token Lifecycle

1. **Generation**: Token dibuat saat pertama kali diminta
2. **Caching**: Token disimpan di memory server untuk reuse
3. **Validation**: Token dicek apakah expired (< 5 menit remaining)
4. **Auto-Refresh**: Frontend otomatis refresh token sebelum expired
5. **Cleanup**: Token dihapus saat user logout

---

## API Endpoints

### 1. GET `/api/arcgis/token`

Mendapatkan token ArcGIS yang valid. Otomatis menggunakan cache atau generate baru jika expired.

**Response:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires": 1697123456789,
  "expiresAt": "2024-10-12T15:30:56.789Z",
  "ssl": false
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing ArcGIS Enterprise credentials..."
}
```

### 2. POST `/api/arcgis/token`

Force refresh token (generate token baru).

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires": 1697123456789,
  "expiresAt": "2024-10-12T15:30:56.789Z",
  "ssl": false
}
```

### 3. DELETE `/api/arcgis/token`

Clear cached token (untuk logout atau troubleshooting).

**Response:**
```json
{
  "success": true,
  "message": "Token cache cleared successfully"
}
```

---

## Penggunaan di Frontend

### 1. Menggunakan `useArcGISToken` Hook

```typescript
import { useArcGISToken } from "@/hooks/use-arcgis-token";

function MyMapComponent() {
  const { token, isLoading, error, refreshToken, isExpired } = useArcGISToken();

  if (isLoading) {
    return <div>Loading ArcGIS token...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <p>Token: {token}</p>
      <button onClick={refreshToken}>Refresh Token</button>
      {isExpired && <p>Token will expire soon!</p>}
    </div>
  );
}
```

### 2. Hook Features

- ✅ Auto-fetch token on mount
- ✅ Auto-refresh before expiration (5 minutes buffer)
- ✅ Loading and error states
- ✅ Manual refresh capability
- ✅ Expiration checking

---

## Menambahkan Layer ArcGIS

### 1. Feature Layer dari ArcGIS Enterprise

Edit `components/map/ArcGISMap.tsx`:

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

// Di dalam useEffect, setelah membuat map:
const featureLayer = new FeatureLayer({
  url: process.env.NEXT_PUBLIC_ARCGIS_MAP_SERVICE_URL + "/0", // Layer 0
  outFields: ["*"], // Fetch all fields
  title: "My Feature Layer",
});

map.add(featureLayer);
```

### 2. Map Image Layer

```typescript
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";

const mapImageLayer = new MapImageLayer({
  url: process.env.NEXT_PUBLIC_ARCGIS_MAP_SERVICE_URL,
  title: "My Map Service",
  sublayers: [
    {
      id: 0,
      visible: true
    }
  ]
});

map.add(mapImageLayer);
```

### 3. Tile Layer (Cached Service)

```typescript
import TileLayer from "@arcgis/core/layers/TileLayer";

const tileLayer = new TileLayer({
  url: "https://your-server.com/arcgis/rest/services/CachedMap/MapServer",
  title: "Cached Tile Layer"
});

map.add(tileLayer);
```

---

## Troubleshooting

### Problem: "Missing ArcGIS Enterprise credentials"

**Solution:**
1. Pastikan file `.env` exists dan berisi semua variable yang diperlukan
2. Restart development server: `npm run dev`
3. Cek apakah environment variables ter-load: `console.log(process.env.ARCGIS_PORTAL_URL)`

### Problem: "Failed to load basemap"

**Solution:**
1. Cek koneksi internet
2. Cek apakah ArcGIS Portal URL benar
3. Coba gunakan basemap sederhana: `basemap: "osm"`

### Problem: "Token expired" atau "401 Unauthorized"

**Solution:**
1. Manual refresh token:
   ```typescript
   const { refreshToken } = useArcGISToken();
   await refreshToken();
   ```
2. Cek kredensial ArcGIS (username/password)
3. Clear token cache: `DELETE /api/arcgis/token`

### Problem: "CORS Error"

**Solution:**
1. Tambahkan domain aplikasi Anda ke ArcGIS Portal CORS allowed origins
2. Di ArcGIS Portal Admin:
   - Security → CORS
   - Add: `http://localhost:3000` (development)
   - Add: `https://your-domain.com` (production)

### Problem: "Layer tidak muncul"

**Solution:**
1. Cek URL layer benar: buka di browser
2. Cek layer visible: `layer.visible = true`
3. Cek extent/zoom level: layer mungkin di luar view extent
4. Cek console untuk error loading

---

## Testing

### 1. Test Token Generation

```bash
# Dengan curl
curl http://localhost:3000/api/arcgis/token
```

### 2. Test Manual dari Browser Console

```javascript
// Fetch token
fetch('/api/arcgis/token')
  .then(r => r.json())
  .then(data => console.log('Token:', data));

// Refresh token
fetch('/api/arcgis/token', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Refreshed:', data));
```

---

## Security Best Practices

1. ✅ **NEVER commit `.env` file** to git
2. ✅ Store credentials in environment variables only
3. ✅ Use HTTPS in production
4. ✅ Rotate passwords regularly
5. ✅ Use role-based access in ArcGIS Enterprise
6. ✅ Implement rate limiting on token endpoints
7. ✅ Monitor token usage and access logs

---

## Additional Resources

- [ArcGIS REST API Documentation](https://developers.arcgis.com/rest/)
- [ArcGIS JS API Documentation](https://developers.arcgis.com/javascript/)
- [Token-based Authentication](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/token-based-authentication/)

---

## Support

Jika mengalami masalah:

1. Cek console browser untuk error messages
2. Cek server logs (terminal)
3. Verifikasi kredensial ArcGIS Enterprise
4. Cek network tab untuk failed requests
5. Hubungi ArcGIS administrator jika credential tidak valid


