"use client";

import { useEffect, useRef, useState } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import "@arcgis/core/assets/esri/themes/light/main.css";
import { useArcGISToken } from "@/hooks/use-arcgis-token";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import LayerList from "@arcgis/core/widgets/LayerList";
import Expand from "@arcgis/core/widgets/Expand";
import { useMapFilterStore } from "@/lib/stores/mapFilterStore";

export default function ArcGISMap() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<MapView | null>(null);
  const mapServerLayerRef = useRef<MapImageLayer | null>(null);
  const gapDetectionLayerRef = useRef<MapImageLayer | null>(null);
  const { token, isLoading, error: tokenError } = useArcGISToken();
  const [mapError, setMapError] = useState<string | null>(null);
  const selectedNode = useMapFilterStore((state) => state.selectedNode);
  const selectedMenu = useMapFilterStore((state) => state.selectedMenu);
  const getDefinitionExpression = useMapFilterStore((state) => state.getDefinitionExpression);

  // Effect to initialize map
  useEffect(() => {
    if (!mapDiv.current || !token) return;

    console.log("🗺️ Initializing ArcGIS Map with Enterprise authentication...");

    // Register token with IdentityManager for automatic authentication
    IdentityManager.registerToken({
      server: "https://geoportal.mnmsugarhub.com/server/rest/services",
      token: token,
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
      ssl: true,
    });
    console.log("✅ Token registered with IdentityManager");

    try {
      // Use WebTileLayer for Google Satellite as basemap
      const googleSatellite = new WebTileLayer({
        urlTemplate: "https://mt1.google.com/vt/lyrs=s&x={col}&y={row}&z={level}",
        copyright: "Google Satellite",
        subDomains: ["mt0", "mt1", "mt2", "mt3"],
        title: "Google Sattelite",
      });

      const mapServerLayer = new MapImageLayer({
        url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Unit/MapServer",
        title: "Land Unit",
        sublayers: [
          {
            id: 5,
            title: "Unplantable",
            visible: true,
          },
          {
            id: 4,
            title: "Mill",
            visible: true,
          },
          {
            id: 3,
            title: "Region",
            visible: true,
          },
          {
            id: 2,
            title: "Farm",
            visible: true,
            opacity: 1,
          },
          {
            id: 1,
            title: "Block",
            visible: true,
            opacity: 0.8
          },
          {
            id: 0,
            title: "Paddock",
            visible: true,
          },
        ],
      });


      const landClearingLayer = new MapImageLayer({
        url: "https://geoportal.mnmsugarhub.com/server/rest/services/Aerial_Photo/Land_Clearing_GPA_/MapServer",
        title: "Land Clearing",
        // sublayers: [
        //   {
        //     id: 45,
        //     title: "Aerial Photo",
        //     visible: true,
        //   }
        // ],
      });

      // Gap Detection layers - shown when "gap-detection" menu is active
      const gapDetectionLayer = new MapImageLayer({
        url: "https://geoportal.mnmsugarhub.com/server/rest/services/Gap_Detection/MapServer",
        title: "Gap Detection",
        visible: false, // Hidden by default, shown when menu is active
        sublayers: [
          // {
          //   id: 0,
          //   title: "Sugarcane",
          //   visible: true,
          // },
          // {
          //   id: 1,
          //   title: "Planting Line",
          //   visible: true,
          // },
          {
            id: 2,
            title: "Gap Detection",
            visible: true,
            opacity:1.0
          },
        ],
      });

      // Store reference for visibility control
      gapDetectionLayerRef.current = gapDetectionLayer;

      const map = new Map({
        layers: [googleSatellite, landClearingLayer, mapServerLayer, gapDetectionLayer], // add Google Satellite as base layer
      });

      // Store reference for filtering
      mapServerLayerRef.current = mapServerLayer;
      console.log("📍 Map layers configured");

      // Create MapView centered on Papua, Indonesia
      const view = new MapView({
        container: mapDiv.current,
        map: map,
        center: [140.6137582, -8.2490545], // Papua coordinates (longitude, latitude)
        zoom: 12, // Appropriate zoom level for regional view
        popup: {
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: "bottom-left",
          },
        },
      });

      // Enable auto-popup for MapImageLayer
      // MapImageLayer supports popupTemplate which will auto-query on click
      mapServerLayer.when(() => {
        // Configure popup template for each sublayer with dynamic titles
        mapServerLayer.sublayers?.forEach((sublayer) => {
          // Map sublayer title to field name
          const titleFieldMap: Record<string, string> = {
            "Mill": "{mill}",
            "Region": "{region}",
            "Farm": "{farm}",
            "Block": "{block}",
            "Paddock": "{paddock}",
          };

          const fieldName = sublayer.title ? titleFieldMap[sublayer.title] || "{name}" : "{name}";

          // Configure popup template - MapImageLayer may not fully support Arcade expressions
          // Use simple field-based popup to avoid arcade-execution-error
          sublayer.popupTemplate = {
            title: `${sublayer.title} ${fieldName}  ({fid_1})`,
            content: [
              {
                type: "fields",
                fieldInfos: [
                  { fieldName: "fid_1", label: "FID" },
                  { fieldName: "pu", label: "Production Unit" },
                  { fieldName: "region", label: "Region" },
                  { fieldName: "farm", label: "Farm" },
                  { fieldName: "block", label: "Block" },
                  { fieldName: "paddock", label: "Paddock" },
                ],
              },
            ],
          };

          // Set initial definition expression (show all)
          sublayer.definitionExpression = "1=1";
        });
        console.log("✅ Popup templates configured for sublayers");
      });

      // Add LayerList widget
      const layerList = new LayerList({
        view: view,
        listItemCreatedFunction: (event) => {
          const item = event.item;

          // Show legend for operational layers
          if (item.layer && item.layer.type !== "web-tile") {
            item.panel = {
              content: "legend",
              open: false,
            };
          }
        },
      });

      // Add LayerList inside an Expand widget
      const layerListExpand = new Expand({
        view: view,
        content: layerList,
        expanded: false,
        expandIcon: "layers",
        expandTooltip: "Layer List",
      });

      // Add the widget to the view
      view.ui.add(layerListExpand, "top-right");

      console.log("✅ LayerList widget added");

      // Store view reference
      mapViewRef.current = view;

      // Handle any errors
      view.when(
        () => {
          console.log("✅ Map loaded successfully - Papua region");
          console.log("✅ ArcGIS Enterprise authentication active");
          setMapError(null);
        },
        (error: Error) => {
          console.error("❌ Map loading error:", error);
          setMapError(error.message);
        }
      );

      return () => {
        console.log("🧹 Cleaning up map view...");
        mapViewRef.current = null;
        mapServerLayerRef.current = null;
        gapDetectionLayerRef.current = null;
        view.destroy();
      };
    } catch (error) {
      console.error("❌ Error initializing map:", error);
      setMapError(error instanceof Error ? error.message : "Unknown error");
    }
  }, [token, mapDiv]);

  // Effect to apply filter when tree selection changes
  useEffect(() => {
    if (!mapServerLayerRef.current || !mapViewRef.current) return;

    const defExpression = getDefinitionExpression();
    const view = mapViewRef.current;
    const layer = mapServerLayerRef.current;
    const gapLayer = gapDetectionLayerRef.current;

    console.log("🔍 Applying map filter:", {
      selectedNode: selectedNode?.item.name,
      level: selectedNode?.level,
      expression: defExpression,
    });

    // Clear popup and highlights when filter changes
    if (view.popup) {
      view.popup.visible = false;
    }
    view.graphics.removeAll();
    console.log("🧹 Cleared popup and highlights");

    // Apply definition expression to all sublayers
    layer.sublayers?.forEach((sublayer) => {
      if (sublayer) {
        sublayer.definitionExpression = defExpression;
      }
    });

    // Apply dedicated filter to Gap Detection map image layer (only when fields match)
    if (gapLayer) {
      const escapeWhereValue = (value: string) => value.replace(/'/g, "''");
      const fieldMap: Record<string, string> = {
        mill: "mill",
        region: "region",
        farm: "farm",
        block: "block",
        paddock: "paddock",
      };

      const buildGapDetectionExpression = (availableFields: string[]) => {
        if (!selectedNode) {
          return "1=1";
        }

        const conditions: string[] = [];
        const available = new Set(
          availableFields.map((name) => name.toLowerCase())
        );

        const maybeAddCondition = (fieldName: string | undefined, value?: string | null) => {
          if (!fieldName || !value) return;
          if (available.has(fieldName.toLowerCase())) {
            conditions.push(`${fieldName} = '${escapeWhereValue(value)}'`);
          }
        };

        // FID-based filter (if provided and supported by layer)
        maybeAddCondition("fid_1", selectedNode.item?.fid_1);

        // Filters coming from parent hierarchy
        if (selectedNode.filters) {
          Object.entries(selectedNode.filters).forEach(([key, filterValue]) => {
            const mappedField = fieldMap[key];
            maybeAddCondition(mappedField, filterValue ?? undefined);
          });
        }

        // Ensure current level condition is applied if field exists
        maybeAddCondition(fieldMap[selectedNode.level], selectedNode.item?.name);

        return conditions.length > 0 ? conditions.join(" AND ") : "1=1";
      };

      const applyGapDetectionFilter = async () => {
        if (!gapLayer?.sublayers) return;

        await Promise.all(
          gapLayer.sublayers.map(async (sublayer) => {
            if (!sublayer) return;
            try {
              await sublayer.load();
              const availableFields = sublayer.fields?.map((field) => field.name) ?? [];
              const gapExpression = buildGapDetectionExpression(availableFields);
              sublayer.definitionExpression = gapExpression;
              console.log("🎯 Gap Detection filter applied:", {
                sublayer: sublayer.title,
                expression: gapExpression,
                availableFields,
              });
            } catch (error) {
              console.error("❌ Failed to apply Gap Detection filter:", {
                sublayer: sublayer.title,
                error,
              });
            }
          })
        );

        gapLayer.refresh();
      };

      applyGapDetectionFilter();
    }

    // Refresh the layer to apply new filter
    layer.refresh();

    // Zoom to filtered features extent
    if (selectedNode && view) {
      // Query one sublayer for extent based on selected level
      const layerIdMap: Record<string, string> = {
        pu: '4',
        region: '3',
        farm: '2',
        block: '1',
        paddock: '0',
      };
      const queryLayerId = layerIdMap[selectedNode.level] || '0';
      const queryExtentUrl = `${layer.url}/${queryLayerId}/query`;

      const queryParams = new URLSearchParams({
        where: defExpression,
        returnGeometry: "true",
        returnExtentOnly: "true",
        f: "json",
        token: token || "",
      });

      const fullQueryUrl = `${queryExtentUrl}?${queryParams.toString()}`;
      console.log("🔍 Querying extent:", {
        url: queryExtentUrl,
        layerId: queryLayerId,
        level: selectedNode.level,
        where: defExpression,
        fullUrl: fullQueryUrl.replace(token || "", "***")
      });

      fetch(fullQueryUrl)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("📦 Extent query result:", data);

          // Check if error exists (even if empty object)
          if (data.error) {
            const errorKeys = Object.keys(data.error || {});
            const errorMsg = data.error?.message || data.error?.code || (errorKeys.length === 0 ? "Empty error object" : JSON.stringify(data.error));
            console.error("❌ Extent query error:", {
              message: errorMsg,
              code: data.error?.code,
              details: data.error?.details,
              errorKeys: errorKeys,
              fullError: data.error,
              queryUrl: queryExtentUrl,
              layerId: queryLayerId,
              whereClause: defExpression
            });
            return;
          }

          if (data.extent && data.extent.xmin != null && data.extent.ymin != null && data.extent.xmax != null && data.extent.ymax != null) {
            console.log("📐 Extent found:", data.extent);

            // Zoom to extent with animation using ArcGIS Extent class
            import("@arcgis/core/geometry/Extent").then(({ default: Extent }) => {
              if (!view) {
                console.warn("⚠️ MapView not available");
                return;
              }

              const extent = new Extent({
                xmin: data.extent.xmin,
                ymin: data.extent.ymin,
                xmax: data.extent.xmax,
                ymax: data.extent.ymax,
                spatialReference: data.extent.spatialReference || { wkid: 4326 },
              });

              view.goTo(extent.expand(1.2), { // Expand 20% for padding
                duration: 1000,
                easing: "ease-in-out",
              }).then(() => {
                console.log("✅ Zoomed to filtered extent:", selectedNode?.item?.name);
              }).catch(err => {
                console.error("❌ Error zooming:", err);
              });
            }).catch(err => {
              console.error("❌ Error importing Extent:", err);
            });
          } else {
            console.warn("⚠️ No valid extent returned from query", data.extent);
          }
        })
        .catch(err => {
          console.error("❌ Error querying extent:", err);
        });
    }
  }, [selectedNode, getDefinitionExpression, token]);

  // Effect to control Gap Detection layer visibility based on selected menu
  useEffect(() => {
    if (!gapDetectionLayerRef.current) return;

    const layer = gapDetectionLayerRef.current;
    const isGapDetectionActive = selectedMenu === "gap-detection";

    console.log("🔍 Gap Detection layer visibility:", {
      selectedMenu,
      isGapDetectionActive,
    });

    layer.visible = isGapDetectionActive;

    if (isGapDetectionActive) {
      console.log("✅ Gap Detection layers enabled");
    } else {
      console.log("❌ Gap Detection layers disabled");
    }
  }, [selectedMenu]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading ArcGIS Enterprise...
          </p>
        </div>
      </div>
    );
  }

  // Show token error
  if (tokenError) {
  return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            ArcGIS Authentication Error
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {tokenError}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Please check your ArcGIS Enterprise credentials in environment variables.
          </p>
        </div>
      </div>
    );
  }

  // Show map error
  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        <div className="text-center max-w-md p-6">
          <div className="text-orange-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Map Loading Error
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {mapError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div ref={mapDiv} style={{ height: "100%", width: "100%" }} />

      {/* Active Filter Badge */}
      {selectedNode && (
        <div className="absolute top-4 left-16 bg-white dark:bg-gray-800 shadow-lg rounded px-4 py-2 z-10 border border-primary">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Filtered by {selectedNode.level}:
            </span>
            <span className="text-sm font-medium">{selectedNode.item.name}</span>
            {selectedNode.item.fid_1 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                {selectedNode.item.fid_1}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
