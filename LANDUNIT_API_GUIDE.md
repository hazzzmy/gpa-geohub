# Land Unit API Guide

API untuk query hierarchical land units dari ArcGIS MapServer dengan filtering yang efisien.

## 📋 Table of Contents
1. [API Endpoints](#api-endpoints)
2. [Hierarchical Structure](#hierarchical-structure)
3. [Query Examples](#query-examples)
4. [Postman Testing](#postman-testing)
5. [Response Format](#response-format)

---

## 🔗 API Endpoints

### Base Endpoint
```
GET /api/landunit/[level]
```

### Supported Levels
- `mill` - Layer 1
- `region` - Layer 2
- `farm` - Layer 3
- `block` - Layer 5
- `paddock` - Layer 7

### Query Parameters (All Optional)
- `mill` - Filter by mill name
- `region` - Filter by region name
- `farm` - Filter by farm name
- `block` - Filter by block name
- `paddock` - Filter by paddock name

---

## 🌳 Hierarchical Structure

```
Mill (Level 1)
  └── Region (Level 2)
      └── Farm (Level 3)
          └── Block (Level 5)
              └── Paddock (Level 7)
```

### Filtering Best Practices
1. **Always filter by parent** untuk performa optimal
2. Querying tanpa filter akan return semua data (bisa lambat)
3. API akan memberikan warning jika query tanpa parent filter

---

## 📝 Query Examples

### 1. Get All Mills
```bash
GET /api/landunit/mill
```
**Use Case:** Mendapatkan list semua mills untuk dropdown pertama

**Response:**
```json
{
  "success": true,
  "level": "mill",
  "count": 1,
  "filters": {},
  "data": [
    {
      "id": "1",
      "name": "Jagebob Mill",
      "mill_id": "1",
      "mill": "Jagebob Mill",
      ...
    }
  ]
}
```

---

### 2. Get Regions by Mill
```bash
GET /api/landunit/region?mill=Jagebob Mill
```
**Use Case:** Setelah user pilih mill, tampilkan regions

**Response:**
```json
{
  "success": true,
  "level": "region",
  "count": 5,
  "filters": {
    "mill": "Jagebob Mill"
  },
  "data": [
    {
      "id": "1",
      "name": "JAGF",
      "region_id": "1",
      "region": "JAGF",
      "mill": "Jagebob Mill",
      ...
    }
  ]
}
```

---

### 3. Get Farms by Mill and Region
```bash
GET /api/landunit/farm?mill=Jagebob Mill&region=JAGF
```
**Use Case:** Setelah user pilih mill dan region, tampilkan farms

**Response:**
```json
{
  "success": true,
  "level": "farm",
  "count": 10,
  "filters": {
    "mill": "Jagebob Mill",
    "region": "JAGF"
  },
  "data": [...]
}
```

---

### 4. Get Blocks by Farm
```bash
GET /api/landunit/block?farm=FARM_NAME
```
**Use Case:** Setelah user pilih farm, tampilkan blocks

---

### 5. Get Paddocks by Block
```bash
GET /api/landunit/paddock?block=BLOCK_NAME
```
**Use Case:** Setelah user pilih block, tampilkan paddocks

---

### 6. Get All Data (Not Recommended for Child Levels)
```bash
# ✅ OK - Mills are top level
GET /api/landunit/mill

# ⚠️ Warning - May return many results
GET /api/landunit/region

# ❌ Not Recommended - Will be slow
GET /api/landunit/paddock
```

---

## 🧪 Postman Testing

### Import Collection
1. Open Postman
2. Click **Import**
3. Select `LandUnit_API.postman_collection.json`
4. Collection akan ter-import dengan 10 pre-configured requests

### Set Environment Variable
1. Klik **Environments** di Postman
2. Create new environment atau edit existing
3. Add variable:
   - **Variable:** `BASE_URL`
   - **Value:** `http://localhost:3000` (atau URL deployment Anda)

### Testing Flow (Recommended Order)
1. **Get All Mills** - Dapatkan mill names
2. **Get Regions by Mill** - Gunakan mill name dari step 1
3. **Get Farms by Region** - Gunakan region name dari step 2
4. **Get Blocks by Farm** - Gunakan farm name dari step 3
5. **Get Paddocks by Block** - Gunakan block name dari step 4

### Quick Test (Single Request)
```bash
# Postman atau cURL
curl "http://localhost:3000/api/landunit/mill"
```

---

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "level": "region",
  "count": 5,
  "filters": {
    "mill": "Jagebob Mill"
  },
  "warning": null,
  "data": [
    {
      "id": "1",
      "name": "JAGF",
      "region_id": "1",
      "region": "JAGF",
      "mill": "Jagebob Mill",
      "mill_id": "1",
      "objectid": 1,
      "globalid": "{...}",
      ...
    }
  ],
  "metadata": {
    "layerId": 2,
    "nameField": "region",
    "idField": "region_id",
    "whereClause": "mill = 'Jagebob Mill'"
  }
}
```

### Error Response (Invalid Level)
```json
{
  "error": "Invalid level",
  "message": "Level must be one of: mill, region, farm, block, paddock",
  "validLevels": ["mill", "region", "farm", "block", "paddock"]
}
```

### Error Response (ArcGIS Error)
```json
{
  "error": "ArcGIS API Error",
  "message": "Invalid token",
  "code": 498,
  "details": []
}
```

### Warning Response (No Parent Filter)
```json
{
  "success": true,
  "level": "farm",
  "count": 100,
  "filters": {},
  "warning": "Warning: Querying farm without region filter may return many results",
  "data": [...]
}
```

---

## 🎯 Use Cases

### Cascading Dropdowns
```javascript
// Frontend example
async function loadRegions(millName) {
  const response = await fetch(
    `/api/landunit/region?mill=${encodeURIComponent(millName)}`
  );
  const data = await response.json();
  return data.data; // Array of regions
}
```

### Map Filtering
```javascript
// Filter map features based on user selection
async function filterMapByFarm(farmName) {
  const response = await fetch(
    `/api/landunit/paddock?farm=${encodeURIComponent(farmName)}`
  );
  const data = await response.json();
  // Use data.data to filter map
}
```

### Export Data
```javascript
// Get all data for a specific branch
async function exportBranchData(millName) {
  const regions = await fetch(`/api/landunit/region?mill=${millName}`);
  const farms = await fetch(`/api/landunit/farm?mill=${millName}`);
  const blocks = await fetch(`/api/landunit/block?mill=${millName}`);
  // Combine and export
}
```

---

## 🔧 Configuration

### Environment Variables
Required in `.env`:
```env
ARCGIS_MAP_SERVICE_URL=https://geoportal.mnmsugarhub.com/server/rest/services/Paddock_Naming_Concept_GPA/MapServer
ARCGIS_PORTAL_URL=https://geoportal.mnmsugarhub.com
ARCGIS_USERNAME=your_username
ARCGIS_PASSWORD=your_password
```

---

## 📊 Performance Tips

1. **Always use parent filters** untuk child levels
2. **Limit berdasarkan use case:**
   - Dropdowns: Filter by immediate parent
   - Reports: Filter by top-level (mill/region)
   - Map: Filter by visible area (farm/block)
3. **Cache results** di frontend jika data tidak sering berubah
4. **Batch requests** untuk multiple levels jika diperlukan

---

## 🐛 Troubleshooting

### Token Errors (498/499)
```bash
# Token expired atau invalid
# Solution: API akan auto-refresh token, coba request ulang
```

### Empty Results
```bash
# Periksa filter values (case-sensitive!)
# Good: mill=Jagebob Mill
# Bad:  mill=jagebob mill
```

### Slow Queries
```bash
# Jangan query all paddocks tanpa filter
# BAD:  GET /api/landunit/paddock
# GOOD: GET /api/landunit/paddock?block=B1
```

---

## 📞 Support

Untuk issues atau questions, check:
- API logs di server console
- Postman collection untuk examples
- `landunit.ipynb` untuk raw query testing

