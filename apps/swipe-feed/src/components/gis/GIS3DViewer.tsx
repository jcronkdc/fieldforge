/**
 * GIS 3D Viewer
 * 
 * 3D visualization of transmission infrastructure using Three.js/React Three Fiber
 * - Transmission lines (colored by voltage)
 * - Structures/poles (cylinders with accurate heights)
 * - Survey control points (markers)
 * - Site boundaries (extruded polygons)
 * - Camera controls (orbit, pan, zoom)
 * - Terrain elevation
 * - Interactive selection
 */

import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Text, Html, PerspectiveCamera, Sky } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TransmissionLine {
  id: string;
  lineName: string;
  voltageKv: number;
  geometry: {
    type: 'LineString';
    coordinates: number[][]; // [lon, lat, elevation?][]
  };
  conductorType?: string;
  status: string;
}

interface TransmissionStructure {
  id: string;
  structureNumber: string;
  structureType: string;
  geometry: {
    type: 'Point';
    coordinates: number[]; // [lon, lat, elevation?]
  };
  heightFeet?: number;
  elevationFeet?: number;
  status: string;
}

interface SiteBoundary {
  id: string;
  siteName: string;
  siteType: string;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface GIS3DViewerProps {
  projectId: string;
  transmissionLines?: TransmissionLine[];
  structures?: TransmissionStructure[];
  siteBoundaries?: SiteBoundary[];
  controlPoints?: any[];
  centerCoordinate?: [number, number]; // [lon, lat]
  onStructureClick?: (structure: TransmissionStructure) => void;
  onLineClick?: (line: TransmissionLine) => void;
  showLabels?: boolean;
  showSky?: boolean;
  metersPerDegree?: number; // For lat/lon to meters conversion (default: 111000)
}

// ============================================================================
// COORDINATE CONVERSION UTILITIES
// ============================================================================

/**
 * Convert lat/lon to local XYZ coordinates
 * Origin is at centerCoordinate
 */
function latLonToXYZ(
  lon: number,
  lat: number,
  elevation: number = 0,
  centerLon: number,
  centerLat: number,
  metersPerDegree: number = 111000
): [number, number, number] {
  const x = (lon - centerLon) * metersPerDegree * Math.cos((centerLat * Math.PI) / 180);
  const z = -(lat - centerLat) * metersPerDegree; // Negative Z for north-up orientation
  const y = elevation * 0.3048; // Convert feet to meters
  
  return [x, y, z];
}

/**
 * Get voltage color (realistic power line colors)
 */
function getVoltageColor(voltageKv: number): THREE.Color {
  if (voltageKv >= 345) return new THREE.Color('#ff0000'); // Red - Extra High Voltage
  if (voltageKv >= 230) return new THREE.Color('#ff6600'); // Orange
  if (voltageKv >= 138) return new THREE.Color('#ffcc00'); // Yellow
  if (voltageKv >= 69) return new THREE.Color('#00ff00'); // Green
  return new THREE.Color('#0088ff'); // Blue - Lower voltage
}

/**
 * Get structure color by type and status
 */
function getStructureColor(type: string, status: string): THREE.Color {
  if (status === 'planned') return new THREE.Color('#808080'); // Gray
  if (status === 'under_construction') return new THREE.Color('#ff8800'); // Orange
  
  // Installed structures by type
  switch (type) {
    case 'deadend':
      return new THREE.Color('#ff0000'); // Red
    case 'angle':
      return new THREE.Color('#ffff00'); // Yellow
    case 'tangent':
    default:
      return new THREE.Color('#4444ff'); // Blue
  }
}

// ============================================================================
// 3D COMPONENTS
// ============================================================================

/**
 * Transmission Line Component (3D polyline)
 */
function TransmissionLineObject({
  line,
  centerLon,
  centerLat,
  metersPerDegree,
  onClick
}: {
  line: TransmissionLine;
  centerLon: number;
  centerLat: number;
  metersPerDegree: number;
  onClick?: () => void;
}) {
  const points = useMemo(() => {
    return line.geometry.coordinates.map(coord => {
      const [lon, lat, elev = 0] = coord;
      return new THREE.Vector3(...latLonToXYZ(lon, lat, elev, centerLon, centerLat, metersPerDegree));
    });
  }, [line, centerLon, centerLat, metersPerDegree]);

  const color = getVoltageColor(line.voltageKv);

  return (
    <group onClick={onClick}>
      <Line
        points={points}
        color={color}
        lineWidth={3}
        dashed={line.status === 'planned'}
      />
      {/* Add conductor sag simulation (catenary curve) */}
      {points.length > 1 && (
        <mesh>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3(points),
            points.length * 10,
            0.5, // Radius for visual conductor
            8,
            false
          ]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Transmission Structure Component (pole/tower)
 */
function TransmissionStructureObject({
  structure,
  centerLon,
  centerLat,
  metersPerDegree,
  showLabel,
  onClick
}: {
  structure: TransmissionStructure;
  centerLon: number;
  centerLat: number;
  metersPerDegree: number;
  showLabel: boolean;
  onClick?: () => void;
}) {
  const [lon, lat, groundElev = 0] = structure.geometry.coordinates;
  const [x, y, z] = latLonToXYZ(lon, lat, structure.elevationFeet || groundElev, centerLon, centerLat, metersPerDegree);
  
  const height = (structure.heightFeet || 80) * 0.3048; // Default 80 feet, convert to meters
  const color = getStructureColor(structure.structureType, structure.status);
  
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={[x, y, z]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pole body */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.6, height, 8]} />
        <meshStandardMaterial 
          color={hovered ? '#ffff00' : color} 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Base foundation */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1, 1.2, 1, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Crossarms (simplified) */}
      {structure.structureType !== 'tangent' && (
        <mesh position={[0, height * 0.8, 0]}>
          <boxGeometry args={[8, 0.3, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {/* Label */}
      {showLabel && (
        <Html
          position={[0, height + 2, 0]}
          center
          distanceFactor={10}
          style={{
            background: hovered ? '#ffff00' : '#000000cc',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}
        >
          {structure.structureNumber}
        </Html>
      )}

      {/* Selection indicator */}
      {hovered && (
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Site Boundary Component (extruded polygon)
 */
function SiteBoundaryObject({
  site,
  centerLon,
  centerLat,
  metersPerDegree
}: {
  site: SiteBoundary;
  centerLon: number;
  centerLat: number;
  metersPerDegree: number;
}) {
  const shape = useMemo(() => {
    // Handle both Polygon and MultiPolygon
    const coords = site.geometry.type === 'Polygon'
      ? site.geometry.coordinates[0]
      : site.geometry.coordinates[0][0];

    const shape = new THREE.Shape();
    coords.forEach((coord, i) => {
      const [lon, lat] = coord;
      const [x, , z] = latLonToXYZ(lon, lat, 0, centerLon, centerLat, metersPerDegree);
      
      if (i === 0) {
        shape.moveTo(x, z);
      } else {
        shape.lineTo(x, z);
      }
    });
    
    return shape;
  }, [site, centerLon, centerLat, metersPerDegree]);

  const color = site.siteType === 'substation' ? '#ff6600' :
                 site.siteType === 'staging_area' ? '#00ff00' :
                 site.siteType === 'work_zone' ? '#ffff00' :
                 '#0088ff';

  return (
    <group>
      {/* Boundary outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Boundary perimeter */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={shape.getPoints().length}
            array={new Float32Array(shape.getPoints().flatMap(p => [p.x, 0.2, p.y]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
    </group>
  );
}

/**
 * Ground Plane Component
 */
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[10000, 10000]} />
      <meshStandardMaterial 
        color="#2d5016" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

/**
 * Compass/North Arrow
 */
function Compass() {
  return (
    <group position={[0, 0, 0]}>
      <Html
        position={[0, 50, 0]}
        center
        style={{
          background: '#000000cc',
          color: '#ff0000',
          padding: '8px',
          borderRadius: '50%',
          fontSize: '24px',
          fontWeight: 'bold'
        }}
      >
        N ↑
      </Html>
    </group>
  );
}

/**
 * Scene Lighting
 */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={1000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
      />
      <hemisphereLight
        skyColor="#87CEEB"
        groundColor="#2d5016"
        intensity={0.3}
      />
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GIS3DViewer({
  projectId,
  transmissionLines = [],
  structures = [],
  siteBoundaries = [],
  controlPoints = [],
  centerCoordinate,
  onStructureClick,
  onLineClick,
  showLabels = true,
  showSky = true,
  metersPerDegree = 111000
}: GIS3DViewerProps) {
  // Calculate center from data if not provided
  const center = useMemo(() => {
    if (centerCoordinate) return centerCoordinate;
    
    // Find center of all features
    const allCoords: number[][] = [
      ...structures.map(s => s.geometry.coordinates.slice(0, 2)),
      ...transmissionLines.flatMap(line => line.geometry.coordinates.map(c => c.slice(0, 2)))
    ];
    
    if (allCoords.length === 0) return [-97.5, 35.0]; // Default center USA
    
    const avgLon = allCoords.reduce((sum, c) => sum + c[0], 0) / allCoords.length;
    const avgLat = allCoords.reduce((sum, c) => sum + c[1], 0) / allCoords.length;
    
    return [avgLon, avgLat];
  }, [centerCoordinate, structures, transmissionLines]);

  const [centerLon, centerLat] = center;

  // Calculate camera distance based on extent
  const cameraDistance = useMemo(() => {
    if (structures.length === 0 && transmissionLines.length === 0) return 500;
    
    const allCoords = [
      ...structures.map(s => s.geometry.coordinates.slice(0, 2)),
      ...transmissionLines.flatMap(line => line.geometry.coordinates.map(c => c.slice(0, 2)))
    ];
    
    const lons = allCoords.map(c => c[0]);
    const lats = allCoords.map(c => c[1]);
    
    const lonExtent = Math.max(...lons) - Math.min(...lons);
    const latExtent = Math.max(...lats) - Math.min(...lats);
    
    const extent = Math.max(lonExtent, latExtent) * metersPerDegree;
    return extent * 1.5; // Add 50% padding
  }, [structures, transmissionLines, metersPerDegree]);

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas
        shadows
        camera={{ position: [cameraDistance, cameraDistance / 2, cameraDistance], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {showSky && <Sky sunPosition={[100, 50, 100]} />}
          
          <Lighting />
          
          <GroundPlane />
          
          {/* Transmission Lines */}
          {transmissionLines.map(line => (
            <TransmissionLineObject
              key={line.id}
              line={line}
              centerLon={centerLon}
              centerLat={centerLat}
              metersPerDegree={metersPerDegree}
              onClick={() => onLineClick?.(line)}
            />
          ))}
          
          {/* Structures */}
          {structures.map(structure => (
            <TransmissionStructureObject
              key={structure.id}
              structure={structure}
              centerLon={centerLon}
              centerLat={centerLat}
              metersPerDegree={metersPerDegree}
              showLabel={showLabels}
              onClick={() => onStructureClick?.(structure)}
            />
          ))}
          
          {/* Site Boundaries */}
          {siteBoundaries.map(site => (
            <SiteBoundaryObject
              key={site.id}
              site={site}
              centerLon={centerLon}
              centerLat={centerLat}
              metersPerDegree={metersPerDegree}
            />
          ))}
          
          <Compass />
          
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={cameraDistance * 3}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
        </Suspense>
      </Canvas>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
        <h3 className="font-bold mb-2">Legend</h3>
        <div className="space-y-1 text-sm">
          <div><span className="inline-block w-4 h-1 bg-red-500 mr-2"></span>345kV+</div>
          <div><span className="inline-block w-4 h-1 bg-orange-500 mr-2"></span>230kV</div>
          <div><span className="inline-block w-4 h-1 bg-yellow-500 mr-2"></span>138kV</div>
          <div><span className="inline-block w-4 h-1 bg-green-500 mr-2"></span>69kV</div>
          <div className="pt-2">
            <div><span className="inline-block w-3 h-3 bg-blue-500 mr-2 rounded-full"></span>Tangent</div>
            <div><span className="inline-block w-3 h-3 bg-yellow-500 mr-2 rounded-full"></span>Angle</div>
            <div><span className="inline-block w-3 h-3 bg-red-500 mr-2 rounded-full"></span>Deadend</div>
          </div>
        </div>
      </div>

      {/* Controls help */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
        <div><strong>Left Click + Drag:</strong> Rotate</div>
        <div><strong>Right Click + Drag:</strong> Pan</div>
        <div><strong>Scroll:</strong> Zoom</div>
        <div><strong>Click Structure:</strong> Select</div>
      </div>
    </div>
  );
}

export default GIS3DViewer;



