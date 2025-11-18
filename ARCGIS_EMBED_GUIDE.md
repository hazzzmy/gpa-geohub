# ArcGIS Embed Guide - Cara Embed Dashboard dengan Token

Ada **2 pendekatan** untuk embed ArcGIS Dashboard/App dengan token authentication:

---

## 📋 Pendekatan 1: Token di URL (Current Implementation)

### ✅ Kelebihan:
- **Simple**: Token langsung ditambahkan ke URL sebagai query parameter
- **Direct**: Tidak perlu proxy, langsung ke ArcGIS Portal
- **Flexible**: Bisa digunakan untuk berbagai jenis ArcGIS apps

### ⚠️ Kekurangan:
- **Security**: Token terlihat di URL client-side (bisa di-inspect)
- **Token Exposure**: Token bisa di-copy dari browser DevTools

### 🔧 Cara Kerja:

1. **Token di-generate di server** via `/api/arcgis/token`
2. **Token dikirim ke client** via React hook `useArcGISToken()`
3. **Client menambahkan token ke URL** sebagai query parameter
4. **Iframe load URL** dengan token

### 📝 Implementasi:

```tsx
// Menggunakan ArcGISDashboardEmbed
<ArcGISDashboardEmbed
  dashboardUrl="https://geoportal.mnmsugarhub.com/portal/apps/dashboards/118f24e23de84824ab01b0565a6050c9"
  title="Land Clearing Dashboard"
/>
```

**Component akan otomatis:**
- Fetch token dari `/api/arcgis/token`
- Menambahkan `?token=xxx&redirect=false` ke URL
- Auto-refresh token sebelum expired

### 🔍 URL yang dihasilkan:
```
https://geoportal.mnmsugarhub.com/portal/apps/dashboards/118f24e23de84824ab01b0565a6050c9?token=abc123&redirect=false
```

---

## 📋 Pendekatan 2: Proxy API (More Secure)

### ✅ Kelebihan:
- **Secure**: Token tidak pernah exposed ke client
- **Server-side**: Token hanya ada di server
- **Better Security**: Token tidak bisa di-copy dari browser

### ⚠️ Kekurangan:
- **Additional Layer**: Perlu proxy API route
- **Server Load**: Semua request harus melalui Next.js server

### 🔧 Cara Kerja:

1. **Token di-generate dan disimpan di server** (tidak dikirim ke client)
2. **Client request ke proxy API** `/api/arcgis-proxy/[...path]`
3. **Proxy API forward request ke ArcGIS Portal** dengan token
4. **Proxy API return response** ke client

### 📝 Implementasi:

#### 1. Menggunakan Proxy API Route:

```tsx
// Menggunakan ArcGISDashboardEmbedProxy
<ArcGISDashboardEmbedProxy
  portalPath="apps/dashboards/118f24e23de84824ab01b0565a6050c9"
  title="Land Clearing Dashboard"
/>
```

#### 2. Atau langsung menggunakan iframe:

```tsx
<iframe
  src="/api/arcgis-proxy/apps/dashboards/118f24e23de84824ab01b0565a6050c9"
  width="100%"
  height="800"
/>
```

**Proxy API akan otomatis:**
- Get token dari server (cached)
- Forward request ke ArcGIS Portal dengan token
- Return response ke client

### 🔍 URL yang dihasilkan:
```
/api/arcgis-proxy/apps/dashboards/118f24e23de84824ab01b0565a6050c9
```

**Token ditambahkan di server-side**, tidak terlihat di client.

---

## 🔄 Perbandingan

| Aspek | Token di URL | Proxy API |
|-------|-------------|-----------|
| **Security** | ⚠️ Token terlihat di URL | ✅ Token tidak terlihat |
| **Simplicity** | ✅ Lebih simple | ⚠️ Perlu proxy route |
| **Performance** | ✅ Direct ke ArcGIS | ⚠️ Through Next.js server |
| **Flexibility** | ✅ Lebih flexible | ⚠️ Perlu proxy untuk setiap request |
| **Token Management** | ✅ Auto-refresh di client | ✅ Auto-refresh di server |

---

## 🎯 Rekomendasi

### Gunakan **Token di URL** jika:
- ✅ Dashboard/App tidak mengandung sensitive data
- ✅ Token bisa di-share (tidak masalah jika terlihat)
- ✅ Perlu performance yang lebih baik (direct connection)

### Gunakan **Proxy API** jika:
- ✅ Security adalah prioritas utama
- ✅ Token tidak boleh di-expose ke client
- ✅ Dashboard/App mengandung sensitive data
- ✅ Perlu audit trail untuk semua request

---

## 📚 Contoh Penggunaan

### Contoh 1: Dashboard (Current)
```tsx
<ArcGISDashboardEmbed
  dashboardUrl="https://geoportal.mnmsugarhub.com/portal/apps/dashboards/118f24e23de84824ab01b0565a6050c9"
  title="Land Clearing Dashboard"
/>
```

### Contoh 2: Web App Viewer
```tsx
<ArcGISDashboardEmbed
  dashboardUrl="https://geoportal.mnmsugarhub.com/portal/apps/webappviewer/index.html?id=9df4b5c46b30432b98d90ddb937cffeb"
  title="Land Clearing Web App Viewer"
/>
```

### Contoh 3: Filter Gallery (Proxy)
```tsx
<ArcGISDashboardEmbedProxy
  portalPath="apps/instant/filtergallery/index.html?appid=e9f8c21ab2b5459ebd821ad24f855299"
  title="Land Clearing Filter Gallery"
/>
```

---

## 🔐 Token Configuration

Token di-generate dengan konfigurasi berikut:

```typescript
{
  username: process.env.ARCGIS_USERNAME,
  password: process.env.ARCGIS_PASSWORD,
  referer: process.env.ARCGIS_REFERER || process.env.NEXT_PUBLIC_APP_URL,
  expiration: "60", // 60 minutes
  client: "referer", // For iframe compatibility
}
```

### Environment Variables:
```env
ARCGIS_PORTAL_URL=https://geoportal.mnmsugarhub.com/portal
ARCGIS_USERNAME=your_username
ARCGIS_PASSWORD=your_password
ARCGIS_REFERER=https://your-app.com
```

---

## 🚀 Quick Start

### Untuk menggunakan Token di URL (Current):
```tsx
import ArcGISDashboardEmbed from '@/modules/landing-page/components/ArcGISDashboardEmbed';

<ArcGISDashboardEmbed
  dashboardUrl="https://geoportal.mnmsugarhub.com/portal/apps/dashboards/118f24e23de84824ab01b0565a6050c9"
  title="My Dashboard"
/>
```

### Untuk menggunakan Proxy API:
```tsx
import ArcGISDashboardEmbedProxy from '@/modules/landing-page/components/ArcGISDashboardEmbedProxy';

<ArcGISDashboardEmbedProxy
  portalPath="apps/dashboards/118f24e23de84824ab01b0565a6050c9"
  title="My Dashboard"
/>
```

---

## 📝 Notes

1. **Token Auto-Refresh**: Kedua pendekatan memiliki auto-refresh token sebelum expired
2. **No Re-login**: Parameter `redirect=false` memastikan tidak ada redirect ke login page
3. **CORS**: Pastikan ArcGIS Portal mengizinkan request dari domain Anda
4. **Token Expiration**: Token default expires dalam 60 menit, auto-refresh setiap 5 menit sebelum expired

---

## 🐛 Troubleshooting

### Issue: Dashboard masih meminta login
**Solution**:
- Pastikan token valid dan tidak expired
- Check apakah `redirect=false` parameter sudah ditambahkan
- Verify ArcGIS Portal configuration

### Issue: CORS error
**Solution**:
- Gunakan Proxy API untuk menghindari CORS issues
- Atau pastikan ArcGIS Portal mengizinkan origin Anda

### Issue: Token tidak ter-update
**Solution**:
- Check `/api/arcgis/token` endpoint apakah berfungsi
- Verify environment variables sudah benar
- Check console untuk error messages


