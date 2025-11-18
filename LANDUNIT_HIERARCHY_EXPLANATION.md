# Penjelasan Sistem Hierarki Land Unit Tree

## 📊 Struktur Hierarki

Sistem Land Unit Tree menggunakan struktur hierarki **5 level** yang saling berhubungan:

```
Production Unit (PU)
    └── Region
        └── Farm
            └── Block
                └── Paddock
```

---

## 🏗️ Level-by-Level Breakdown

### 1. **Production Unit (PU)** - Level Tertinggi
- **Parent**: `null` (tidak ada parent, ini adalah root level)
- **Layer ID**: `4`
- **Field Name**: `pu`
- **Field ID**: `pu_id`
- **Child**: `region`

**Karakteristik:**
- Level paling atas dalam hierarki
- Setiap PU dapat memiliki banyak Region
- Tidak memiliki parent, jadi semua PU di-load saat pertama kali

**Contoh:**
- "Jagebob Mill"
- "Global Papua Abadi"

---

### 2. **Region** - Level 2
- **Parent**: `pu` (Production Unit)
- **Layer ID**: `3`
- **Field Name**: `region`
- **Field ID**: `region_id`
- **Child**: `farm`

**Karakteristik:**
- Setiap Region dimiliki oleh satu Production Unit
- Setiap Region dapat memiliki banyak Farm
- Query memerlukan filter `pu` untuk efisiensi

**Contoh:**
- "JAGF" (di bawah "Jagebob Mill")
- "REGION_A" (di bawah "Global Papua Abadi")

---

### 3. **Farm** - Level 3
- **Parent**: `region`
- **Layer ID**: `2`
- **Field Name**: `farm`
- **Field ID**: `farm_id`
- **Child**: `block`

**Karakteristik:**
- Setiap Farm dimiliki oleh satu Region
- Setiap Farm dapat memiliki banyak Block
- Query memerlukan filter `region` (dan optional `pu`) untuk efisiensi

**Contoh:**
- "FARM_001" (di bawah "JAGF")
- "FARM_002" (di bawah "JAGF")

---

### 4. **Block** - Level 4
- **Parent**: `farm`
- **Layer ID**: `1`
- **Field Name**: `block`
- **Field ID**: `block_id`
- **Child**: `paddock`

**Karakteristik:**
- Setiap Block dimiliki oleh satu Farm
- Setiap Block dapat memiliki banyak Paddock
- Query memerlukan filter `farm` (dan optional parent filters) untuk efisiensi

**Contoh:**
- "BLOCK_A" (di bawah "FARM_001")
- "BLOCK_B" (di bawah "FARM_001")

---

### 5. **Paddock** - Level Terendah (Leaf Node)
- **Parent**: `block`
- **Layer ID**: `0`
- **Field Name**: `paddock`
- **Field ID**: `paddock_id`
- **Child**: `null` (tidak ada child, ini adalah leaf node)

**Karakteristik:**
- Level paling bawah dalam hierarki
- Setiap Paddock dimiliki oleh satu Block
- Tidak memiliki child, jadi tidak bisa di-expand
- Query memerlukan filter `block` (dan optional parent filters) untuk efisiensi

**Contoh:**
- "PADDOCK_001" (di bawah "BLOCK_A")
- "PADDOCK_002" (di bawah "BLOCK_A")

---

## 🔄 Cara Kerja Hierarki

### 1. **Initial Load**
```
User membuka Land Unit Tree
    ↓
Fetch semua Production Units (PU)
    GET /api/landunit/pu
    ↓
Display semua PU sebagai root nodes
```

### 2. **User Expands PU**
```
User click expand pada "Jagebob Mill"
    ↓
Fetch Regions dengan filter pu="Jagebob Mill"
    GET /api/landunit/region?pu=Jagebob+Mill
    ↓
Display regions sebagai children dari "Jagebob Mill"
```

### 3. **User Expands Region**
```
User click expand pada "JAGF"
    ↓
Fetch Farms dengan filter pu="Jagebob Mill" & region="JAGF"
    GET /api/landunit/farm?pu=Jagebob+Mill&region=JAGF
    ↓
Display farms sebagai children dari "JAGF"
```

### 4. **User Expands Farm**
```
User click expand pada "FARM_001"
    ↓
Fetch Blocks dengan filter pu="Jagebob Mill" & region="JAGF" & farm="FARM_001"
    GET /api/landunit/block?pu=Jagebob+Mill&region=JAGF&farm=FARM_001
    ↓
Display blocks sebagai children dari "FARM_001"
```

### 5. **User Expands Block**
```
User click expand pada "BLOCK_A"
    ↓
Fetch Paddocks dengan filter pu="Jagebob Mill" & region="JAGF" & farm="FARM_001" & block="BLOCK_A"
    GET /api/landunit/paddock?pu=Jagebob+Mill&region=JAGF&farm=FARM_001&block=BLOCK_A
    ↓
Display paddocks sebagai children dari "BLOCK_A"
    (Paddock tidak bisa di-expand karena leaf node)
```

---

## 🎯 Parent-Child Relationship

### Mapping Parent ke Child:
```typescript
const childLevelMap = {
  pu: "region",        // PU → Region
  region: "farm",      // Region → Farm
  farm: "block",       // Farm → Block
  block: "paddock",    // Block → Paddock
  paddock: null,       // Paddock → (no child, leaf node)
}
```

### Parent Configuration:
```typescript
LAYER_CONFIG = {
  pu: { parent: null },           // PU tidak punya parent
  region: { parent: "pu" },       // Region parent adalah PU
  farm: { parent: "region" },     // Farm parent adalah Region
  block: { parent: "farm" },      // Block parent adalah Farm
  paddock: { parent: "block" },   // Paddock parent adalah Block
}
```

---

## 🔍 Filter System

### Hierarchical Filtering
Setiap level menggunakan filter dari parent-nya untuk query yang lebih efisien:

**Contoh Query untuk Farm:**
```sql
WHERE pu = 'Jagebob Mill' AND region = 'JAGF'
```

**Contoh Query untuk Block:**
```sql
WHERE pu = 'Jagebob Mill' AND region = 'JAGF' AND farm = 'FARM_001'
```

### Filter Building Logic:
```typescript
// Saat user expand node, filter dibangun seperti ini:
const childFilters = {
  ...filters,           // Inherit filters dari parent
  [level]: item.name,   // Tambahkan filter untuk level saat ini
};

// Contoh: Expand Region "JAGF" di bawah PU "Jagebob Mill"
// childFilters = { pu: "Jagebob Mill", region: "JAGF" }
```

---

## 📡 ArcGIS MapServer Integration

### Layer Mapping:
Setiap level terhubung ke layer ArcGIS MapServer yang berbeda:

| Level | Layer ID | MapServer Endpoint |
|-------|----------|-------------------|
| PU | 4 | `/MapServer/4/query` |
| Region | 3 | `/MapServer/3/query` |
| Farm | 2 | `/MapServer/2/query` |
| Block | 1 | `/MapServer/1/query` |
| Paddock | 0 | `/MapServer/0/query` |

### Base URL:
```
https://geoportal.mnmsugarhub.com/server/rest/services/Paddock_Naming_Concept_GPA/MapServer
```

---

## ⚡ Lazy Loading Strategy

### On-Demand Loading:
- **Initial**: Hanya load Production Units (PU)
- **On Expand**: Load children hanya saat node di-expand
- **Caching**: Data di-cache selama 5 menit untuk performa

### Benefits:
- ✅ Fast initial load (hanya load root level)
- ✅ Efficient data fetching (hanya load yang diperlukan)
- ✅ Better UX (user tidak perlu menunggu semua data)

---

## 🎨 Visual Representation

```
📁 Production Unit: "Jagebob Mill" [1]
  ├─ 📁 Region: "JAGF" [3]
  │   ├─ 📁 Farm: "FARM_001" [2]
  │   │   ├─ 📁 Block: "BLOCK_A" [5]
  │   │   │   ├─ 📄 Paddock: "PADDOCK_001"
  │   │   │   ├─ 📄 Paddock: "PADDOCK_002"
  │   │   │   └─ 📄 Paddock: "PADDOCK_003"
  │   │   └─ 📁 Block: "BLOCK_B" [3]
  │   │       ├─ 📄 Paddock: "PADDOCK_004"
  │   │       └─ 📄 Paddock: "PADDOCK_005"
  │   │   └─ 📁 Farm: "FARM_002" [1]
  │   │       └─ 📁 Block: "BLOCK_C" [2]
  │   │           └─ 📄 Paddock: "PADDOCK_006"
  │   └─ 📁 Region: "REGION_B" [1]
  │       └─ 📁 Farm: "FARM_003" [1]
  │           └─ 📁 Block: "BLOCK_D" [1]
  │               └─ 📄 Paddock: "PADDOCK_007"
```

**Legend:**
- 📁 = Expandable node (memiliki children)
- 📄 = Leaf node (tidak memiliki children)
- [n] = Jumlah children (ditampilkan sebagai badge)

---

## 🔐 Data Flow

### 1. **Component Level** (`LandUnitTreeView.tsx`)
```typescript
// Initial load
const { data } = useLandUnits("pu");

// On expand
const { data: childData } = useLandUnits(
  childLevel,           // "region", "farm", "block", atau "paddock"
  childFilters,         // { pu: "...", region: "...", ... }
  { enabled: isExpanded && hasChildren }
);
```

### 2. **Hook Level** (`use-landunit.ts`)
```typescript
// Fetch dari API
fetchLandUnits(level, filters)
  → GET /api/landunit/{level}?{filters}
```

### 3. **API Level** (`/api/landunit/[level]/route.ts`)
```typescript
// Build query ke ArcGIS
buildQueryUrl(level)           // → MapServer/{layerId}/query
buildWhereClause(filters)      // → WHERE clause dari filters
  → GET ArcGIS MapServer dengan token
```

### 4. **ArcGIS MapServer**
```typescript
// Return GeoJSON features
{
  features: [
    {
      attributes: {
        pu_id: "...",
        pu: "...",
        region_id: "...",
        region: "...",
        // ... semua fields
      }
    }
  ]
}
```

---

## 📝 Summary

### Hierarki:
```
PU (root) → Region → Farm → Block → Paddock (leaf)
```

### Key Points:
1. **5 Level Hierarki**: PU → Region → Farm → Block → Paddock
2. **Parent-Child Relationship**: Setiap level memiliki parent (kecuali PU) dan child (kecuali Paddock)
3. **Lazy Loading**: Children di-load hanya saat node di-expand
4. **Hierarchical Filtering**: Filter dari parent digunakan untuk query children
5. **ArcGIS Integration**: Setiap level terhubung ke layer MapServer yang berbeda
6. **Leaf Node**: Paddock adalah leaf node (tidak memiliki children)

### Query Pattern:
```
Level 1: GET /api/landunit/pu
Level 2: GET /api/landunit/region?pu={pu_name}
Level 3: GET /api/landunit/farm?pu={pu_name}&region={region_name}
Level 4: GET /api/landunit/block?pu={pu_name}&region={region_name}&farm={farm_name}
Level 5: GET /api/landunit/paddock?pu={pu_name}&region={region_name}&farm={farm_name}&block={block_name}
```

---

## 🎯 Use Cases

### 1. **Browse Hierarchical Structure**
User dapat browse dari Production Unit hingga Paddock untuk melihat struktur organisasi lahan.

### 2. **Filter by Level**
User dapat memilih node di level tertentu untuk filter data di level yang lebih rendah.

### 3. **View Details**
User dapat click "View Details" pada node manapun untuk melihat informasi lengkap.

### 4. **Search**
User dapat search di semua level untuk menemukan node tertentu.

---

## 🔧 Configuration

Semua konfigurasi hierarki ada di:
- **`lib/arcgis/landunit-config.ts`**: Konfigurasi level, parent, layer ID, field names
- **`components/landunit/LandUnitTreeView.tsx`**: UI component dan logic
- **`hooks/use-landunit.ts`**: React hooks untuk data fetching
- **`app/api/landunit/[level]/route.ts`**: API endpoint

---

**Last Updated**: 2024
**Version**: 1.0

