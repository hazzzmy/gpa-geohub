"use client";

import { useEffect, useRef, useState } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Layer from "@arcgis/core/layers/Layer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import LayerList from "@arcgis/core/widgets/LayerList";
import Legend from "@arcgis/core/widgets/Legend";
import Expand from "@arcgis/core/widgets/Expand";
import esriConfig from "@arcgis/core/config";
import "@arcgis/core/assets/esri/themes/light/main.css";
import { useArcGISToken } from "@/hooks/use-arcgis-token";
import { useMapFilterStore } from "@/lib/stores/mapFilterStore";
import { LandUnitTreeViewCompact } from "@/components/landunit";
import Extent from "@arcgis/core/geometry/Extent";

// Type definitions for layer configuration
export interface MapImageLayerConfig {
  type: "map-image";
  url: string;
  title: string;
  visible?: boolean;
  opacity?: number;
  sublayers?: Array<{
    id: number;
    title?: string;
    visible?: boolean;
    opacity?: number;
    definitionExpression?: string;
  }>;
  popupTemplate?: any;
  definitionExpression?: string;
}

export interface FeatureLayerConfig {
  type: "feature";
  url: string;
  title: string;
  visible?: boolean;
  opacity?: number;
  popupTemplate?: any;
  definitionExpression?: string;
  outFields?: string[];
}

export interface WebTileLayerConfig {
  type: "web-tile";
  urlTemplate: string;
  title: string;
  visible?: boolean;
  opacity?: number;
  subDomains?: string[];
  copyright?: string;
}

export interface TileLayerConfig {
  type: "tile";
  url: string;
  title: string;
  visible?: boolean;
  opacity?: number;
}

export interface ImageryLayerConfig {
  type: "imagery";
  url: string;
  title: string;
  visible?: boolean;
  opacity?: number;
}

export type LayerConfig =
  | MapImageLayerConfig
  | FeatureLayerConfig
  | WebTileLayerConfig
  | TileLayerConfig
  | ImageryLayerConfig;

export interface MapExplorerProps {
  /**
   * Array of layer configurations to display on the map
   */
  layers: LayerConfig[];
  
  /**
   * Initial map center coordinates [longitude, latitude]
   * @default [140.6137582, -8.2490545] (Papua, Indonesia)
   */
  center?: [number, number];
  
  /**
   * Initial zoom level
   * @default 12
   */
  zoom?: number;
  
  /**
   * ArcGIS Enterprise server URL for token registration
   * If provided, token will be registered with IdentityManager
   */
  serverUrl?: string;
  
  /**
   * Custom token to use for authentication
   * If not provided, will use useArcGISToken hook
   */
  token?: string | null;
  
  /**
   * Show LayerList widget
   * @default true
   */
  showLayerList?: boolean;
  
  /**
   * Show Legend widget (separate from LayerList)
   * @default false
   */
  showLegend?: boolean;
  
  /**
   * Position of LayerList widget
   * @default "top-right"
   */
  layerListPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  
  /**
   * Position of Legend widget (if showLegend is true)
   * @default "bottom-left"
   */
  legendPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  
  /**
   * Callback when map view is ready
   */
  onMapReady?: (view: MapView) => void;
  
  /**
   * Callback when a layer is clicked
   */
  onLayerClick?: (event: any, layer: Layer) => void;
  
  /**
   * Custom popup configuration
   */
  popupConfig?: {
    dockEnabled?: boolean;
    dockOptions?: {
      buttonEnabled?: boolean;
      breakpoint?: boolean;
      position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    };
  };
  
  /**
   * Custom className for the map container
   */
  className?: string;
  
  /**
   * Enable popup on layer click
   * @default true
   */
  enablePopup?: boolean;
  
  /**
   * Include Land Unit hierarchy layer by default
   * If true, will add Land Unit layer with all sublayers (Unplantable, Mill, Region, Farm, Block, Paddock)
   * @default false
   */
  includeLandUnitLayer?: boolean;
  
  /**
   * Enable Land Unit hierarchy filtering
   * If true, will show Land Unit tree view UI and apply definition expression from mapFilterStore to filter layers by selected land unit
   * @default false
   */
  enableLandUnitFilter?: boolean;
  
  /**
   * Position of Land Unit filter panel (if enableLandUnitFilter is true)
   * @default "top-left"
   */
  landUnitFilterPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * MapExplorer - A reusable ArcGIS Map component with LayerList, Legend, and layer interactions
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <MapExplorer
 *   layers={[
 *     {
 *       type: "map-image",
 *       url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Clearing/Land_Clearing/MapServer",
 *       title: "Land Clearing",
 *       sublayers: [
 *         { id: 7, title: "Layer 7", visible: true }
 *       ]
 *     }
 *   ]}
 *   center={[140.6137582, -8.2490545]}
 *   zoom={12}
 *   showLayerList={true}
 *   showLegend={true}
 * />
 * 
 * // With Land Unit hierarchy layer included by default
 * <MapExplorer
 *   layers={[
 *     {
 *       type: "web-tile",
 *       urlTemplate: "https://mt1.google.com/vt/lyrs=s&x={col}&y={row}&z={level}",
 *       title: "Google Satellite",
 *       subDomains: ["mt0", "mt1", "mt2", "mt3"],
 *     }
 *   ]}
 *   includeLandUnitLayer={true}
 *   center={[140.6137582, -8.2490545]}
 *   zoom={12}
 *   serverUrl="https://geoportal.mnmsugarhub.com/server/rest/services"
 * />
 * 
 * // With Land Unit hierarchy filtering enabled
 * // This will automatically filter layers based on selected node from mapFilterStore
 * <MapExplorer
 *   layers={[
 *     {
 *       type: "map-image",
 *       url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Clearing/Land_Clearing/MapServer",
 *       title: "Land Clearing",
 *       sublayers: [
 *         { id: 7, title: "LC Block Target", visible: true },
 *         { id: 8, title: "LC Progress", visible: true },
 *       ],
 *     }
 *   ]}
 *   enableLandUnitFilter={true}
 *   center={[140.6137582, -8.2490545]}
 *   zoom={12}
 *   serverUrl="https://geoportal.mnmsugarhub.com/server/rest/services"
 * />
 * ```
 */
export default function MapExplorer({
  layers,
  center = [140.6137582, -8.2490545],
  zoom = 12,
  serverUrl,
  token: customToken,
  showLayerList = true,
  showLegend = false,
  layerListPosition = "top-right",
  legendPosition = "top-left",
  onMapReady,
  onLayerClick,
  popupConfig,
  className = "",
  enablePopup = true,
  includeLandUnitLayer = false,
  enableLandUnitFilter = false,
  landUnitFilterPosition = "bottom-left",
}: MapExplorerProps) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const legendDiv = useRef<HTMLDivElement>(null);
  const landUnitFilterDiv = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<MapView | null>(null);
  const layersRef = useRef<Layer[]>([]);
  const isMountedRef = useRef<boolean>(true);
  const { token: hookToken, isLoading, error: tokenError } = useArcGISToken();
  const [mapError, setMapError] = useState<string | null>(null);
  const [landUnitFilterExpanded, setLandUnitFilterExpanded] = useState(false);

  // Use custom token if provided, otherwise use hook token
  const token = customToken !== undefined ? customToken : hookToken;

  // Land Unit hierarchy filtering
  const selectedNode = useMapFilterStore((state) => state.selectedNode);
  const setSelectedNode = useMapFilterStore((state) => state.setSelectedNode);
  const getDefinitionExpression = useMapFilterStore((state) => state.getDefinitionExpression);

  // Create layer instance from configuration
  const createLayer = (config: LayerConfig): Layer | null => {
    try {
      switch (config.type) {
        case "map-image": {
          const layer = new MapImageLayer({
            url: config.url,
            title: config.title,
            visible: config.visible ?? true,
            opacity: config.opacity ?? 1,
            // If sublayers are not specified, don't pass it (let MapImageLayer load all sublayers by default)
            // If sublayers are specified, use them to control which sublayers are visible
            ...(config.sublayers && { sublayers: config.sublayers }),
          });

          // Set definition expression if provided
          if (config.definitionExpression) {
            layer.when(
              () => {
                if (layer.sublayers && layer.sublayers.length > 0) {
                  layer.sublayers.forEach((sublayer) => {
                    if (sublayer) {
                      sublayer.definitionExpression = config.definitionExpression;
                    }
                  });
                }
              },
              (error: Error) => {
                console.warn(`⚠️ Error setting definition expression for layer "${config.title}":`, error);
              }
            );
          }

          // Configure popup template if provided, or create default
          // This allows ArcGIS to automatically handle popup on click (like ArcGISMap.tsx)
          if (enablePopup) {
            layer.when(
              () => {
                // Load layer first to ensure sublayers are available (especially if sublayers weren't specified in config)
                layer.load().then(() => {
                  // Get all sublayers from the layer (either from config or loaded from server)
                  const sublayersToConfigure = layer.sublayers && layer.sublayers.length > 0 
                    ? layer.sublayers 
                    : [];
                  
                  if (sublayersToConfigure.length > 0) {
                    sublayersToConfigure.forEach((sublayer) => {
                    if (sublayer) {
                      if (config.popupTemplate) {
                        // Use custom popup template
                        sublayer.popupTemplate = config.popupTemplate;
                        console.log(`✅ Custom popup template configured for sublayer: ${sublayer.title || sublayer.id}`);
                      } else {
                        // Create default popup template - load sublayer first to get field information
                        // This is critical for MapImageLayer to show attributes correctly
                        const configurePopup = async () => {
                          try {
                            await sublayer.load();
                            
                            // Get all field names from sublayer
                            const fields = sublayer.fields || [];
                            
                            if (fields.length > 0) {
                              // Create fieldInfos from sublayer fields
                              const fieldInfos = fields.map((field: any) => ({
                                fieldName: field.name,
                                label: field.alias || field.name,
                              }));

                              // Create popup template with all fields
                              sublayer.popupTemplate = {
                                title: sublayer.title || config.title || "Feature Information",
                                content: [
                                  {
                                    type: "fields",
                                    fieldInfos: fieldInfos,
                                  },
                                ],
                              };
                              
                              console.log(`✅ Popup template configured for sublayer "${sublayer.title}" with ${fieldInfos.length} fields:`, fieldInfos.map((f: any) => f.fieldName));
                            } else {
                              // No fields available, use empty fieldInfos (ArcGIS will try to show all fields)
                              sublayer.popupTemplate = {
                                title: sublayer.title || config.title || "Feature Information",
                                content: [
                                  {
                                    type: "fields",
                                    fieldInfos: [], // Empty array = ArcGIS will try to show all fields automatically
                                  },
                                ],
                              };
                              console.log(`⚠️ No fields found for sublayer "${sublayer.title}", using empty fieldInfos`);
                            }
                          } catch (error) {
                            console.warn(`⚠️ Error loading sublayer fields for "${sublayer.title}":`, error);
                            // Fallback: use empty fieldInfos (ArcGIS will try to show all fields automatically)
                            sublayer.popupTemplate = {
                              title: sublayer.title || config.title || "Feature Information",
                              content: [
                                {
                                  type: "fields",
                                  fieldInfos: [], // Empty array = ArcGIS will try to show all fields
                                },
                              ],
                            };
                          }
                        };
                        
                        configurePopup();
                      }
                    }
                  });
                  } else {
                    console.log(`⚠️ MapImageLayer "${config.title}" has no sublayers to configure popup for`);
                  }
                }).catch((error: Error) => {
                  console.warn(`⚠️ Error loading MapImageLayer "${config.title}" to get sublayers:`, error);
                });
              },
              (error: Error) => {
                console.warn(`⚠️ Error configuring popup template for layer "${config.title}":`, error);
              }
            );
          }

          return layer;
        }

        case "feature": {
          const layer = new FeatureLayer({
            url: config.url,
            title: config.title,
            visible: config.visible ?? true,
            opacity: config.opacity ?? 1,
            definitionExpression: config.definitionExpression,
            outFields: config.outFields || ["*"],
            popupTemplate: config.popupTemplate && enablePopup ? config.popupTemplate : undefined,
          });

          return layer;
        }

        case "web-tile": {
          const layer = new WebTileLayer({
            urlTemplate: config.urlTemplate,
            title: config.title,
            visible: config.visible ?? true,
            opacity: config.opacity ?? 1,
            subDomains: config.subDomains,
            copyright: config.copyright,
          });

          return layer;
        }

        case "tile": {
          const layer = new TileLayer({
            url: config.url,
            title: config.title,
            visible: config.visible ?? true,
            opacity: config.opacity ?? 1,
          });

          return layer;
        }

        case "imagery": {
          const layer = new ImageryLayer({
            url: config.url,
            title: config.title,
            visible: config.visible ?? true,
            opacity: config.opacity ?? 1,
          });

          return layer;
        }

        default:
          console.warn(`⚠️ Unknown layer type: ${(config as any).type}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ Error creating layer "${config.title}":`, error);
      return null;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapDiv.current) return;

    // Wait for token if needed
    if (!token && customToken === undefined) {
      if (!isLoading && tokenError) {
        setMapError(tokenError);
      }
      return;
    }

    console.log("🗺️ Initializing MapExplorer...");

    // Register token with IdentityManager if serverUrl is provided
    if (token && serverUrl) {
      IdentityManager.registerToken({
        server: serverUrl,
        token: token,
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
        ssl: true,
      });
      console.log("✅ Token registered with IdentityManager");
    }

    try {
      // Create layers from configuration
      // Separate layers by type for proper ordering
      const basemapLayers: Layer[] = [];
      const aerialPhotoLayers: Layer[] = [];
      const operationalLayers: Layer[] = [];
      
      // Add user-provided layers first - separate by type
      layers.forEach((config) => {
        const layer = createLayer(config);
        if (layer) {
          // Basemap layers (web-tile, tile) should be at the bottom
          if (config.type === "web-tile" || config.type === "tile") {
            basemapLayers.push(layer);
          } 
          // Aerial Photo layers should be above basemap but below Land Unit
          else if (
            config.title?.toLowerCase().includes("aerial photo") ||
            config.title?.toLowerCase().includes("aerial") ||
            config.url?.toLowerCase().includes("aerial_photo") ||
            config.url?.toLowerCase().includes("aerial-photo")
          ) {
            aerialPhotoLayers.push(layer);
            console.log(`✅ Aerial Photo layer "${config.title}" added to aerial photo group`);
          } 
          // Other operational layers go on top
          else {
            operationalLayers.push(layer);
          }
        }
      });
      
      // Add Land Unit hierarchy layer by default if enabled (after aerial photo, before other operational layers)
      if (includeLandUnitLayer) {
        const landUnitLayerConfig: MapImageLayerConfig = {
          type: "map-image",
          url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Unit/MapServer",
          title: "Land Unit",
          visible: true,
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
              opacity: 0.8,
            },
            {
              id: 0,
              title: "Paddock",
              visible: true,
            },
          ],
        };
        
        const landUnitLayer = createLayer(landUnitLayerConfig);
        if (landUnitLayer) {
          operationalLayers.push(landUnitLayer);
          console.log("✅ Land Unit hierarchy layer added by default");
        }
      }

      // Combine layers in order: basemap (bottom) -> aerial photo -> land unit -> other operational (top)
      const createdLayers = [...basemapLayers, ...aerialPhotoLayers, ...operationalLayers];
      layersRef.current = createdLayers;

      // Create map
      const map = new Map({
        layers: createdLayers,
      });

      console.log(`📍 Map created with ${createdLayers.length} layers`);

      // Create MapView
      const view = new MapView({
        container: mapDiv.current,
        map: map,
        center: center,
        zoom: zoom,
        popup: enablePopup
          ? {
              dockEnabled: popupConfig?.dockEnabled ?? true,
              dockOptions: popupConfig?.dockOptions ?? {
                buttonEnabled: false,
                breakpoint: false,
                position: popupConfig?.dockOptions?.position ?? "bottom-right",
              },
            }
          : undefined,
      });

      // Hide zoom control and attribution after view is ready
      view.when(
        () => {
          try {
            // Remove zoom control
            view.ui.remove('zoom');
            console.log("✅ Zoom control removed");
          } catch (e) {
            // Zoom control might not exist, that's okay
            console.warn("⚠️ Could not remove zoom control:", e);
          }
          
          // Hide attribution using CSS - multiple selectors to catch all cases
          const hideAttribution = () => {
            if (!mapDiv.current) return;
            
            // Hide all attribution elements
            const attributionElements = mapDiv.current.querySelectorAll(
              '.esri-attribution, .esri-view .esri-attribution, [class*="attribution"], [id*="attribution"]'
            );
            attributionElements.forEach((el) => {
              (el as HTMLElement).style.display = 'none';
              (el as HTMLElement).style.visibility = 'hidden';
              (el as HTMLElement).style.opacity = '0';
            });
          };
          
          // Hide immediately
          hideAttribution();
          
          // Also hide after a short delay to catch dynamically added attribution
          setTimeout(hideAttribution, 500);
          setTimeout(hideAttribution, 1000);
          
          // Watch for new attribution elements
          const observer = new MutationObserver(() => {
            hideAttribution();
          });
          
          if (mapDiv.current) {
            observer.observe(mapDiv.current, { 
              childList: true, 
              subtree: true,
              attributes: true,
              attributeFilter: ['class', 'id']
            });
          }
          
          // Store observer for cleanup
          (view as any)._attributionObserver = observer;
        },
        (error: Error) => {
          console.warn("⚠️ Error in view.when() for zoom/attribution:", error);
        }
      );

      // Popup will be handled by click handler below

      // Handle layer click events for custom callback only
      // Popup is handled automatically by ArcGIS when popupTemplate is configured on sublayers
      // This is the same approach as ArcGISMap.tsx - no manual identify/query needed
      if (onLayerClick) {
        view.on("click", async (event) => {
          const hitTestResponse = await view.hitTest(event);
          
          if (hitTestResponse.results.length > 0) {
            const result = hitTestResponse.results[0];
            let clickedLayer: Layer | null = null;

            // Check if result has a graphic property (for graphics layers)
            if ("graphic" in result && result.graphic && result.graphic.layer) {
              clickedLayer = result.graphic.layer as Layer;
            }
            // For feature layers, check if result has layer property
            else if ("layer" in result && result.layer) {
              const layer = result.layer;
              if (layer && "type" in layer && "loaded" in layer) {
                clickedLayer = layer as Layer;
              }
            }

            // Call custom callback if provided
            if (clickedLayer) {
              onLayerClick(event, clickedLayer);
            }
          }
        });
      }

      // Add LayerList widget
      if (showLayerList) {
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: (event) => {
            const item = event.item;

            // Show legend in panel for operational layers
            if (item.layer && item.layer.type !== "web-tile") {
              item.panel = {
                content: "legend",
                open: false,
              };
            }
          },
        });

        const layerListExpand = new Expand({
          view: view,
          content: layerList,
          expanded: false,
          expandIcon: "layers",
          expandTooltip: "Layer List",
        });

        view.ui.add(layerListExpand, layerListPosition);
        console.log("✅ LayerList widget added");
      }

      // Add Legend widget (separate from LayerList) - directly visible without Expand widget
      if (showLegend) {
        // Wait for view to be ready and legendDiv to be available
        view.when(
          () => {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              if (legendDiv.current) {
                try {
                  const legend = new Legend({
                    view: view,
                    container: legendDiv.current,
                    // Configure legend to show only layers with legend info
                    layerInfos: createdLayers
                      .filter((layer) => layer.type !== "web-tile")
                      .map((layer) => ({
                        layer: layer,
                        title: layer.title || "",
                      })),
                  });

                  console.log("✅ Legend widget added (directly visible)");
                  
                  // Hide "No Legend" text after legend is rendered
                  const hideNoLegend = () => {
                    if (legendDiv.current) {
                      // Multiple selectors to catch all "No Legend" variations
                      const noLegendSelectors = [
                        '.esri-legend__message',
                        '.esri-legend__message-text',
                        '[class*="no-legend"]',
                        '[class*="No Legend"]',
                        'div:contains("No Legend")',
                      ];
                      
                      noLegendSelectors.forEach((selector) => {
                        try {
                          const elements = legendDiv.current?.querySelectorAll(selector);
                          elements?.forEach((el) => {
                            const htmlEl = el as HTMLElement;
                            if (htmlEl.textContent?.toLowerCase().includes('no legend')) {
                              htmlEl.style.display = 'none';
                              htmlEl.style.visibility = 'hidden';
                              htmlEl.style.height = '0';
                              htmlEl.style.margin = '0';
                              htmlEl.style.padding = '0';
                            }
                          });
                        } catch (e) {
                          // Some selectors might not work, that's okay
                        }
                      });
                      
                      // Also check all text nodes
                      const walker = document.createTreeWalker(
                        legendDiv.current,
                        NodeFilter.SHOW_TEXT,
                        null
                      );
                      let node;
                      while ((node = walker.nextNode())) {
                        if (node.textContent?.toLowerCase().includes('no legend')) {
                          const parent = node.parentElement;
                          if (parent) {
                            parent.style.display = 'none';
                          }
                        }
                      }
                    }
                  };
                  
                  // Hide immediately and after delays
                  hideNoLegend();
                  setTimeout(hideNoLegend, 300);
                  setTimeout(hideNoLegend, 600);
                  setTimeout(hideNoLegend, 1000);
                  
                  // Watch for changes
                  if (legendDiv.current) {
                    const observer = new MutationObserver(hideNoLegend);
                    observer.observe(legendDiv.current, {
                      childList: true,
                      subtree: true,
                      characterData: true,
                    });
                    
                    // Store observer for cleanup
                    (legend as any)._noLegendObserver = observer;
                  }
                } catch (error) {
                  console.error("❌ Error creating Legend widget:", error);
                }
              }
            }, 100);
          },
          (error: Error) => {
            console.warn("⚠️ Error in view.when() for legend:", error);
          }
        );
      }

      // Store view reference
      mapViewRef.current = view;

      // Apply initial filter if enabled and there's a selected node
      if (enableLandUnitFilter) {
        // Get current state from store without adding to dependencies
        const currentSelectedNode = useMapFilterStore.getState().selectedNode;
        const defExpression = useMapFilterStore.getState().getDefinitionExpression();
        
        if (currentSelectedNode) {
          console.log("🔍 Applying initial Land Unit filter to all layers:", {
            expression: defExpression,
            totalLayers: createdLayers.length,
          });

          // Apply filter to all operational layers after a short delay to ensure layers are ready
          setTimeout(() => {
            createdLayers.forEach((layer) => {
              if (layer.type === "map-image") {
                const mapImageLayer = layer as MapImageLayer;
                mapImageLayer.when(
                  () => {
                    if (mapImageLayer.sublayers && mapImageLayer.sublayers.length > 0) {
                      mapImageLayer.sublayers.forEach((sublayer) => {
                        if (sublayer) {
                          sublayer.load().then(() => {
                            sublayer.definitionExpression = defExpression;
                          }).catch((error: Error) => {
                            console.warn(`⚠️ Error loading sublayer for initial filter:`, error);
                            sublayer.definitionExpression = defExpression;
                          });
                        }
                      });
                    }
                  },
                  (error: Error) => {
                    console.warn(`⚠️ Error waiting for MapImageLayer "${layer.title}" for initial filter:`, error);
                  }
                );
              } else if (layer.type === "feature") {
                const featureLayer = layer as FeatureLayer;
                featureLayer.when(
                  () => {
                    featureLayer.definitionExpression = defExpression;
                  },
                  (error: Error) => {
                    console.warn(`⚠️ Error waiting for FeatureLayer "${layer.title}" for initial filter:`, error);
                  }
                );
              }
            });
          }, 500);
        }
      }

      // Handle map ready
      view.when(
        () => {
          console.log("✅ MapExplorer loaded successfully");
          setMapError(null);
          if (onMapReady) {
            onMapReady(view);
          }
        },
        (error: Error) => {
          console.error("❌ Map loading error:", error);
          setMapError(error.message);
        }
      );

      return () => {
        console.log("🧹 Cleaning up MapExplorer...");
        isMountedRef.current = false;
        
        // Disconnect attribution observer if exists
        if ((view as any)._attributionObserver) {
          (view as any)._attributionObserver.disconnect();
        }
        
        mapViewRef.current = null;
        layersRef.current = [];
        view.destroy();
      };
    } catch (error) {
      console.error("❌ Error initializing MapExplorer:", error);
      setMapError(error instanceof Error ? error.message : "Unknown error");
    }
  }, [
    token,
    mapDiv,
    layers,
    center,
    zoom,
    serverUrl,
    showLayerList,
    showLegend,
    layerListPosition,
    legendPosition,
    onMapReady,
    onLayerClick,
    popupConfig,
    enablePopup,
    customToken,
    isLoading,
    tokenError,
    includeLandUnitLayer,
    enableLandUnitFilter,
  ]);

  // Effect to apply Land Unit hierarchy filter when enabled and selection changes
  // This is a separate effect to avoid dependency array size changes
  useEffect(() => {
    if (!enableLandUnitFilter || !mapViewRef.current) return;

    // Get definition expression directly from store (not as dependency)
    const defExpression = useMapFilterStore.getState().getDefinitionExpression();
    const view = mapViewRef.current;
    const layers = layersRef.current;

    console.log("🔍 Applying Land Unit filter to ALL layers in MapExplorer:", {
      selectedNode: selectedNode?.item.name,
      level: selectedNode?.level,
      expression: defExpression,
      totalLayers: layers.length,
    });

    // Clear popup and highlights when filter changes
    if (view.popup) {
      view.popup.visible = false;
    }
    view.graphics.removeAll();

    // Apply definition expression to ALL operational layers (MapImageLayer and FeatureLayer)
    // Skip basemap layers (web-tile, tile, imagery)
    layers.forEach((layer) => {
      try {
        // Skip basemap layers - they don't have land unit fields
        if (layer.type === "web-tile" || layer.type === "tile" || layer.type === "imagery") {
          return;
        }

        // For MapImageLayer, apply to all sublayers
        if (layer.type === "map-image") {
          const mapImageLayer = layer as MapImageLayer;
          
          // Wait for layer to be ready
          mapImageLayer.when(
            () => {
              // Apply to all sublayers
              if (mapImageLayer.sublayers && mapImageLayer.sublayers.length > 0) {
                mapImageLayer.sublayers.forEach((sublayer) => {
                  if (sublayer) {
                    // Wait for sublayer to be ready before applying filter
                    sublayer.load().then(() => {
                      sublayer.definitionExpression = defExpression;
                      console.log(`✅ Filter applied to MapImageLayer sublayer "${sublayer.title || sublayer.id}" in layer "${layer.title}"`);
                    }).catch((error: Error) => {
                      console.warn(`⚠️ Error loading sublayer "${sublayer.title || sublayer.id}" in layer "${layer.title}":`, error);
                      // Still try to apply filter even if load fails
                      sublayer.definitionExpression = defExpression;
                    });
                  }
                });
              } else {
                // If no sublayers, try to apply directly (though MapImageLayer usually has sublayers)
                console.log(`⚠️ MapImageLayer "${layer.title}" has no sublayers`);
              }
            },
            (error: Error) => {
              console.warn(`⚠️ Error waiting for MapImageLayer "${layer.title}":`, error);
            }
          );
        }
        // For FeatureLayer, apply directly
        else if (layer.type === "feature") {
          const featureLayer = layer as FeatureLayer;
          
          // Wait for layer to be ready
          featureLayer.when(
            () => {
              featureLayer.definitionExpression = defExpression;
              console.log(`✅ Filter applied to FeatureLayer "${layer.title}"`);
            },
            (error: Error) => {
              console.warn(`⚠️ Error waiting for FeatureLayer "${layer.title}":`, error);
            }
          );
        }
      } catch (error) {
        console.warn(`⚠️ Error processing layer "${layer.title}" for filter:`, error);
      }
    });

    // Fit bounds to selected land unit extent
    if (selectedNode && view && mapViewRef.current === view) {
      // Find Land Unit layer (the one with Land Unit hierarchy)
      const landUnitLayer = layers.find((layer) => {
        if (layer.type === "map-image") {
          const mapImageLayer = layer as MapImageLayer;
          // Check if this is the Land Unit layer by URL or title
          return mapImageLayer.url?.includes("Land_Unit") || mapImageLayer.title === "Land Unit";
        }
        return false;
      }) as MapImageLayer | undefined;

      if (landUnitLayer) {
        // Map level to layer ID (same as ArcGISMap.tsx)
        const layerIdMap: Record<string, string> = {
          pu: '4',
          mill: '4',
          region: '3',
          farm: '2',
          block: '1',
          paddock: '0',
        };
        const queryLayerId = layerIdMap[selectedNode.level] || '0';
        const queryExtentUrl = `${landUnitLayer.url}/${queryLayerId}/query`;

        // Get token from IdentityManager or use current token
        let currentToken = token;
        if (!currentToken && serverUrl) {
          const credential = IdentityManager.findCredential(serverUrl);
          currentToken = credential?.token || null;
        }

        const queryParams = new URLSearchParams({
          where: defExpression,
          returnGeometry: "true",
          returnExtentOnly: "true",
          f: "json",
        });

        if (currentToken) {
          queryParams.append("token", currentToken);
        }

        const fullQueryUrl = `${queryExtentUrl}?${queryParams.toString()}`;
        console.log("🔍 Querying extent for fit bounds:", {
          url: queryExtentUrl,
          layerId: queryLayerId,
          level: selectedNode.level,
          where: defExpression,
        });

        fetch(fullQueryUrl)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
            }
            return res.json();
          })
          .then((data) => {
            // Check if component is still mounted and view is still valid
            if (!isMountedRef.current || !view || !mapViewRef.current || view !== mapViewRef.current) {
              console.warn("⚠️ Component unmounted or MapView no longer valid, skipping fit bounds");
              return;
            }

            console.log("📦 Extent query result:", data);

            // Check if error exists
            if (data.error) {
              console.error("❌ Extent query error:", {
                message: data.error?.message || data.error?.code,
                code: data.error?.code,
                details: data.error?.details,
              });
              return;
            }

            if (data.extent && 
                data.extent.xmin != null && 
                data.extent.ymin != null && 
                data.extent.xmax != null && 
                data.extent.ymax != null) {
              console.log("📐 Extent found, zooming to:", data.extent);

              try {
                const extent = new Extent({
                  xmin: data.extent.xmin,
                  ymin: data.extent.ymin,
                  xmax: data.extent.xmax,
                  ymax: data.extent.ymax,
                  spatialReference: data.extent.spatialReference || { wkid: 4326 },
                });

                // Double check view is still valid before goTo
                if (!isMountedRef.current || !view || !mapViewRef.current || view !== mapViewRef.current) {
                  console.warn("⚠️ Component unmounted or MapView no longer valid before goTo, skipping");
                  return;
                }

                view.goTo(extent.expand(1.2), { // Expand 20% for padding
                  duration: 1000,
                  easing: "ease-in-out",
                }).then(() => {
                  // Check again after goTo completes
                  if (!isMountedRef.current || !view || !mapViewRef.current || view !== mapViewRef.current) {
                    return;
                  }
                  console.log("✅ Zoomed to filtered extent:", selectedNode?.item?.name);
                }).catch((err: Error) => {
                  if (isMountedRef.current) {
                    console.error("❌ Error zooming:", err);
                  }
                });
              } catch (err) {
                console.error("❌ Error creating extent:", err);
              }
            } else {
              console.warn("⚠️ No valid extent returned from query", data.extent);
            }
          })
          .catch((err: Error) => {
            if (isMountedRef.current) {
              console.error("❌ Error querying extent:", err);
            }
          });
      } else {
        console.warn("⚠️ Land Unit layer not found for fit bounds");
      }
    }

    // Reset mounted flag when effect runs
    isMountedRef.current = true;
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [enableLandUnitFilter, selectedNode, token, serverUrl]);

  // Show loading state
  if (isLoading && customToken === undefined) {
    return (
      <div className={`h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading ArcGIS Map...
          </p>
        </div>
      </div>
    );
  }

  // Show token error
  if (tokenError && customToken === undefined) {
    return (
      <div className={`h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${className}`}>
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
      <div className={`h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${className}`}>
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
    <>
      <div className={`relative h-full w-full ${className}`}>
        <div ref={mapDiv} style={{ height: "100%", width: "100%" }} />
        
        {/* Legend container - directly visible without button control */}
        {showLegend && (
          <div
            className={`p-2 absolute bg-white dark:bg-slate-900 shadow-lg rounded-tl rounded-bl z-10 ${
              legendPosition === "top-left" ? "top-0 left-0" :
              legendPosition === "top-right" ? "top-0 right-0" :
              legendPosition === "bottom-left" ? "bottom-4 left-4" :
              "bottom-0 right-0"
            }`}
            style={{ 
              maxWidth: "280px", 
              minWidth: "220px",
              minHeight: "650px",
              maxHeight: "500px",
            }}
          >
            {/* Legend Header */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Legend
              </h3>
            </div>
            
            {/* Legend Content Container */}
            <div
              ref={legendDiv}
              className="p-2 max-h-[650px] overflow-y-auto scrollbar-hide legend-compact"
              style={{ 
                scrollbarWidth: "none", /* Firefox */
                msOverflowStyle: "none", /* IE and Edge */
              }}
            />
          </div>
        )}

        {/* Land Unit Filter Panel - shown when enableLandUnitFilter is true */}
        {enableLandUnitFilter && (
          <div
            ref={landUnitFilterDiv}
            className={`absolute bg-white dark:bg-slate-900 shadow-lg z-10 ${
              landUnitFilterPosition === "top-left" ? "top-4 left-4" :
              landUnitFilterPosition === "top-right" ? "top-4 right-58" :
              landUnitFilterPosition === "bottom-left" ? "bottom-4 left-58" :
              "bottom-4 right-58"
            }`}
            style={{ 
              maxWidth: "280px", 
              minWidth: "240px",
              maxHeight: "350px",
            }}
          >
            {/* Header with toggle button */}
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Filter by Land Unit
              </h3>
              <button
                onClick={() => setLandUnitFilterExpanded(!landUnitFilterExpanded)}
                className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={landUnitFilterExpanded ? "Collapse filter" : "Expand filter"}
              >
                {landUnitFilterExpanded ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>

            {/* Tree View Content */}
            {landUnitFilterExpanded && (
              <div 
                className="overflow-y-auto max-h-[280px] scrollbar-hide" 
                style={{ 
                  scrollbarWidth: "none", 
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="p-2">
                  <LandUnitTreeViewCompact
                    onSelectionChange={(node) => {
                      setSelectedNode(node);
                      console.log("🗺️ Land Unit selected in MapExplorer:", node?.item.name);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Selected node indicator */}
            {selectedNode && !landUnitFilterExpanded && (
              <div className="px-2.5 py-1.5 border-t border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Selected:</div>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                  {selectedNode.item.name}
                </div>
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    console.log("🔄 Land Unit filter cleared");
                  }}
                  className="mt-1 text-[10px] text-primary hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Hide attribution, zoom control and customize legend */}
      <style jsx global>{`
        .esri-attribution {
          display: none !important;
        }
        .esri-view .esri-attribution {
          display: none !important;
        }
        
        /* Hide zoom control */
        .esri-ui .esri-zoom,
        .esri-ui-top-left .esri-zoom,
        .esri-ui-top-right .esri-zoom,
        .esri-ui-bottom-left .esri-zoom,
        .esri-ui-bottom-right .esri-zoom,
        [class*="esri-zoom"] {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Hide scrollbar for legend container and land unit filter */
        .scrollbar-hide::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .scrollbar-hide {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        /* Additional webkit scrollbar hiding */
        .scrollbar-hide *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Hide "No Legend" message */
        .esri-legend__message,
        .esri-legend__message-text,
        [class*="no-legend"],
        [class*="No Legend"] {
          display: none !important;
        }
        
        /* Compact legend styling - reduce padding and size */
        .legend-compact .esri-legend {
          padding: 0 !important;
          font-size: 12px !important;
          line-height: 1.3 !important;
        }
        
        /* Make legend layout more compact using flexbox */
        .legend-compact .esri-legend__layer-item {
          display: flex !important;
          align-items: center !important;
          gap: 5px !important;
        }
        
        .legend-compact .esri-legend__layer-item-content {
          display: flex !important;
          align-items: center !important;
          gap: 5px !important;
          flex: 1 !important;
        }
        
        /* Compact table layout */
        .legend-compact .esri-legend__layer-table {
          display: table !important;
          width: 100% !important;
          border-collapse: collapse !important;
        }
        
        .legend-compact .esri-legend__layer-table-row {
          display: table-row !important;
        }
        
        .legend-compact .esri-legend__layer-table-cell {
          display: table-cell !important;
          vertical-align: middle !important;
        }
        
        .legend-compact .esri-legend__layer {
          margin-bottom: 2px !important;
          padding: 0 !important;
        }
        
        .legend-compact .esri-legend__layer-title {
          font-size: 12px !important;
          font-weight: 600 !important;
          margin-bottom: 2px !important;
          padding: 0 !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__layer-child {
          margin-left: 6px !important;
          margin-bottom: 1px !important;
          padding: 0 !important;
        }
        
        .legend-compact .esri-legend__layer-child-title {
          font-size: 11px !important;
          margin-bottom: 1px !important;
          padding: 0 !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__layer-caption {
          font-size: 11px !important;
          margin-bottom: 1px !important;
          padding: 0 !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__group {
          margin-bottom: 3px !important;
          padding: 0 !important;
        }
        
        .legend-compact .esri-legend__group-title {
          font-size: 11px !important;
          font-weight: 600 !important;
          margin-bottom: 2px !important;
          padding: 0 !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__service {
          margin-bottom: 3px !important;
          padding: 0 !important;
        }
        
        .legend-compact .esri-legend__service-label {
          font-size: 13px !important;
          font-weight: 600 !important;
          margin-bottom: 2px !important;
          padding: 0 !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__symbol {
          margin-right: 3px !important;
          margin-bottom: 0 !important;
          flex-shrink: 0 !important;
          width: 10px !important;
          height: 10px !important;
        }
        
        .legend-compact .esri-legend__symbol-image {
          max-width: 10px !important;
          max-height: 10px !important;
          width: 10px !important;
          height: 10px !important;
        }
        
        /* Make all symbol containers smaller */
        .legend-compact .esri-legend__symbol-container,
        .legend-compact .esri-legend__symbol-wrapper {
          width: 10px !important;
          height: 10px !important;
          min-width: 10px !important;
          min-height: 10px !important;
        }
        
        /* Make symbol squares/rectangles smaller */
        .legend-compact .esri-legend__symbol svg,
        .legend-compact .esri-legend__symbol canvas {
          width: 10px !important;
          height: 10px !important;
        }
        
        /* Make symbol divs smaller */
        .legend-compact .esri-legend__symbol > div {
          width: 10px !important;
          height: 10px !important;
          min-width: 10px !important;
          min-height: 10px !important;
        }
        
        .legend-compact .esri-legend__layer-content {
          margin-left: 0 !important;
          padding: 0 !important;
        }
        
        .legend-compact .esri-legend__layer-table {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .legend-compact .esri-legend__layer-table-row {
          padding: 0 !important;
          line-height: 1.2 !important;
        }
        
        .legend-compact .esri-legend__layer-table-cell {
          padding: 0 2px !important;
          font-size: 11px !important;
          line-height: 1.3 !important;
        }
        
        /* Additional compact styling for legend items */
        .legend-compact .esri-legend__layer-item {
          margin-bottom: 1px !important;
          padding: 0 !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__layer-item-title {
          font-size: 11px !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__layer-item-content {
          margin-top: 0 !important;
          padding: 0 !important;
        }
        
        /* Reduce spacing in legend list items */
        .legend-compact li {
          margin-bottom: 0 !important;
          padding: 0 !important;
          line-height: 1.1 !important;
        }
        
        .legend-compact ul {
          margin: 0 !important;
          padding-left: 8px !important;
        }
        
        /* Make legend text more compact */
        .legend-compact * {
          line-height: 1.3 !important;
        }
        
        /* Additional selectors for even more compact styling */
        .legend-compact .esri-legend__layer-item-label,
        .legend-compact .esri-legend__layer-item-text,
        .legend-compact .esri-legend__layer-item-value {
          font-size: 11px !important;
          line-height: 1.3 !important;
        }
        
        .legend-compact .esri-legend__layer-item-symbol {
          width: 10px !important;
          height: 10px !important;
          margin-right: 3px !important;
          min-width: 10px !important;
          min-height: 10px !important;
        }
        
        /* Additional selectors for symbol boxes */
        .legend-compact .esri-legend__layer-item-symbol > div,
        .legend-compact .esri-legend__layer-item-symbol > span,
        .legend-compact .esri-legend__layer-item-symbol > svg {
          width: 10px !important;
          height: 10px !important;
        }
        
        /* Make table cell symbols smaller */
        .legend-compact .esri-legend__layer-table-cell .esri-legend__symbol,
        .legend-compact .esri-legend__layer-table-cell .esri-legend__symbol-image {
          width: 10px !important;
          height: 10px !important;
          max-width: 10px !important;
          max-height: 10px !important;
        }
      `}</style>
    </>
  );
}

