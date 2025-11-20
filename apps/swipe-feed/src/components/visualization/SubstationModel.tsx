import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Text,
  Box,
  Sphere,
  Cylinder,
  Html,
  PerspectiveCamera,
  ContactShadows,
  Float,
  MeshReflectorMaterial,
  Stage,
  Center,
  useGLTF,
  PivotControls,
  Grid
} from '@react-three/drei';
import * as THREE from 'three';
import {
  Zap,
  AlertCircle,
  CheckCircle,
  Wrench,
  Info,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move3D,
  Eye,
  Gauge,
  ThermometerSun,
  Wind
} from 'lucide-react';

// Equipment component types
type ComponentStatus = 'operational' | 'warning' | 'critical' | 'maintenance';
type EquipmentType = 'transformer' | 'breaker' | 'capacitor' | 'switch' | 'busbar';

interface EquipmentComponent {
  id: string;
  name: string;
  type: EquipmentType;
  status: ComponentStatus;
  temperature: number;
  load: number;
  lastMaintenance: string;
  nextMaintenance: string;
  specifications: {
    voltage: string;
    current: string;
    power: string;
    manufacturer: string;
    model: string;
    year: number;
  };
}

interface TelemetryPoint {
  label: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

// Individual component models
function TransformerModel({ component, onSelect }: { component: EquipmentComponent; onSelect: () => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  const statusColor = {
    operational: '#10B981',
    warning: '#F59E0B',
    critical: '#EF4444',
    maintenance: '#6B7280'
  }[component.status];

  return (
    <group ref={meshRef} onClick={onSelect}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
        {/* Main transformer body */}
        <Box 
          args={[2, 3, 2]} 
          position={[0, 1.5, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial 
            color={hovered ? '#4B5563' : '#374151'} 
            metalness={0.8} 
            roughness={0.2}
          />
        </Box>
        
        {/* Cooling fins */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
          <Box key={i} args={[0.05, 2.5, 1.8]} position={[x, 1.5, 0]}>
            <meshStandardMaterial color="#1F2937" metalness={0.9} />
          </Box>
        ))}
        
        {/* Bushings */}
        <Cylinder args={[0.2, 0.3, 1]} position={[0, 3.5, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Cylinder>
        
        {/* Status indicator */}
        <Sphere args={[0.15]} position={[0, 4, 0]}>
          <meshStandardMaterial 
            color={statusColor} 
            emissive={statusColor} 
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        {/* Base */}
        <Box args={[2.5, 0.2, 2.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1F2937" metalness={0.7} />
        </Box>
        
        {/* Info panel */}
        <Html distanceFactor={8} position={[0, 5, 0]}>
          {hovered && (
            <div className="bg-slate-900/90 px-3 py-2 rounded-lg backdrop-blur-sm border border-blue-500/30">
              <div className="font-bold text-white">{component.name}</div>
              <div className="text-xs text-blue-400">{component.specifications.voltage}</div>
              <div className={`text-xs ${
                component.status === 'operational' ? 'text-green-400' :
                component.status === 'warning' ? 'text-yellow-400' :
                component.status === 'critical' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {component.status.toUpperCase()}
              </div>
            </div>
          )}
        </Html>
      </Float>
    </group>
  );
}

function BreakerModel({ component, onSelect }: { component: EquipmentComponent; onSelect: () => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const [isOpen, setIsOpen] = useState(component.status === 'maintenance');

  useFrame((state) => {
    if (meshRef.current && component.status === 'operational') {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.02 + 1;
      meshRef.current.scale.set(1, pulse, 1);
    }
  });

  return (
    <group ref={meshRef} onClick={() => { onSelect(); setIsOpen(!isOpen); }}>
      {/* Breaker housing */}
      <Box args={[1.5, 2, 1]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </Box>
      
      {/* Contact arm - animated */}
      <group rotation={[0, 0, isOpen ? Math.PI / 6 : 0]} position={[0, 2, 0]}>
        <Box args={[0.2, 1.5, 0.2]} position={[0, 0.75, 0]}>
          <meshStandardMaterial color="#8B4513" metalness={0.9} />
        </Box>
      </group>
      
      {/* Insulators */}
      <Cylinder args={[0.3, 0.2, 0.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#F3F4F6" roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.3, 0.2, 0.5]} position={[0, 2.75, 0]}>
        <meshStandardMaterial color="#F3F4F6" roughness={0.8} />
      </Cylinder>
      
      {/* Status LED */}
      <Sphere args={[0.1]} position={[0.8, 1, 0.5]}>
        <meshStandardMaterial 
          color={isOpen ? '#EF4444' : '#10B981'} 
          emissive={isOpen ? '#EF4444' : '#10B981'} 
          emissiveIntensity={0.8}
        />
      </Sphere>
    </group>
  );
}

// Equipment detail panel
function EquipmentDetailPanel({ component, onClose }: { component: EquipmentComponent; onClose: () => void }) {
  const telemetryData: TelemetryPoint[] = [
    { label: 'Temperature', value: component.temperature, unit: '°C', status: component.temperature > 80 ? 'warning' : 'normal' },
    { label: 'Load', value: component.load, unit: '%', status: component.load > 90 ? 'critical' : component.load > 70 ? 'warning' : 'normal' },
    { label: 'Voltage', value: component.specifications.voltage, unit: '', status: 'normal' },
    { label: 'Current', value: component.specifications.current, unit: '', status: 'normal' }
  ];

  return (
    <div className="absolute top-4 right-4 w-80 max-w-[calc(100vw-2rem)] bg-slate-800/95 backdrop-blur-sm rounded-lg p-6 border border-slate-700 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            {component.name}
          </h3>
          <p className="text-sm text-slate-400">{component.type.toUpperCase()}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
        component.status === 'operational' ? 'bg-green-500/20 text-green-400' :
        component.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
        component.status === 'critical' ? 'bg-red-500/20 text-red-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {component.status === 'operational' ? <CheckCircle className="w-4 h-4" /> :
         component.status === 'warning' ? <AlertCircle className="w-4 h-4" /> :
         component.status === 'critical' ? <AlertCircle className="w-4 h-4" /> :
         <Wrench className="w-4 h-4" />}
        {component.status.toUpperCase()}
      </div>

      {/* Telemetry */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Telemetry</h4>
        {telemetryData.map((point, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-sm text-slate-400">{point.label}</span>
            <span className={`font-mono font-bold ${
              point.status === 'critical' ? 'text-red-400' :
              point.status === 'warning' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {point.value}{point.unit}
            </span>
          </div>
        ))}
      </div>

      {/* Specifications */}
      <div className="space-y-2 mb-6">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Specifications</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-500">Manufacturer:</span>
            <div className="text-white">{component.specifications.manufacturer}</div>
          </div>
          <div>
            <span className="text-slate-500">Model:</span>
            <div className="text-white">{component.specifications.model}</div>
          </div>
          <div>
            <span className="text-slate-500">Power Rating:</span>
            <div className="text-white">{component.specifications.power}</div>
          </div>
          <div>
            <span className="text-slate-500">Year:</span>
            <div className="text-white">{component.specifications.year}</div>
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Maintenance Schedule</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Last Service:</span>
            <span className="text-white">{component.lastMaintenance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Next Service:</span>
            <span className="text-yellow-400">{component.nextMaintenance}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Schedule Service
        </button>
        <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
          View History
        </button>
      </div>
    </div>
  );
}

// Main SubstationModel component
export const SubstationModel: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<EquipmentComponent | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'exploded' | 'xray'>('overview');
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  // Mock equipment data
  const equipment: EquipmentComponent[] = [
    {
      id: '1',
      name: 'Main Transformer T1',
      type: 'transformer',
      status: 'operational',
      temperature: 75,
      load: 68,
      lastMaintenance: '2024-10-15',
      nextMaintenance: '2025-04-15',
      specifications: {
        voltage: '115kV/34.5kV',
        current: '1000A',
        power: '50MVA',
        manufacturer: 'ABB',
        model: 'TXP-5000',
        year: 2020
      }
    },
    {
      id: '2',
      name: 'Circuit Breaker CB1',
      type: 'breaker',
      status: 'warning',
      temperature: 85,
      load: 92,
      lastMaintenance: '2024-09-20',
      nextMaintenance: '2025-03-20',
      specifications: {
        voltage: '115kV',
        current: '2000A',
        power: 'N/A',
        manufacturer: 'Siemens',
        model: 'HB-200',
        year: 2019
      }
    }
  ];

  return (
    <div className="h-full w-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Substation Equipment
          </h3>
          
          {/* View mode buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('exploded')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === 'exploded' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Exploded
            </button>
            <button
              onClick={() => setViewMode('xray')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === 'xray' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              X-Ray
            </button>
          </div>
          
          {/* Toggle options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showGrid} 
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              Show Grid
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoRotate} 
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              Auto Rotate
            </label>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <h4 className="text-white font-semibold mb-2 text-sm">Equipment Status</h4>
          <div className="space-y-2">
            {equipment.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedComponent(item)}
                className="w-full text-left p-2 rounded hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{item.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'operational' ? 'bg-green-400' :
                    item.status === 'warning' ? 'bg-yellow-400' :
                    item.status === 'critical' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`} />
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ThermometerSun className="w-3 h-3" />
                    {item.temperature}°C
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {item.load}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Camera controls hint */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            <span>Rotate: Left Click</span>
          </div>
          <div className="flex items-center gap-2">
            <Move3D className="w-4 h-4" />
            <span>Pan: Right Click</span>
          </div>
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            <span>Zoom: Scroll</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={1}
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3B82F6" />
        
        {/* Environment */}
        <Environment preset="city" />
        <fog attach="fog" args={['#0f172a', 20, 50]} />
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[0, 0]}
            resolution={2048}
            mixBlur={1}
            mixStrength={50}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#101010"
            metalness={0.5}
          />
        </mesh>
        
        {/* Grid */}
        {showGrid && (
          <Grid 
            args={[20, 20]} 
            cellSize={1}
            cellThickness={0.5}
            cellColor="#1F2937"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#374151"
            fadeDistance={30}
            fadeStrength={1}
          />
        )}
        
        <Suspense fallback={null}>
          {/* Equipment Models */}
          <group position={viewMode === 'exploded' ? [-3, 0, 0] : [0, 0, 0]}>
            <TransformerModel 
              component={equipment[0]} 
              onSelect={() => setSelectedComponent(equipment[0])}
            />
          </group>
          
          <group position={viewMode === 'exploded' ? [3, 0, 0] : [4, 0, 0]}>
            <BreakerModel 
              component={equipment[1]} 
              onSelect={() => setSelectedComponent(equipment[1])}
            />
          </group>
          
          {/* Connection lines */}
          {viewMode !== 'exploded' && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([2, 2, 0, 4, 2, 0])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#3B82F6" linewidth={2} />
            </line>
          )}
          
          <ContactShadows 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={10} 
            resolution={256} 
            position={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Equipment Detail Panel */}
      {selectedComponent && (
        <EquipmentDetailPanel 
          component={selectedComponent} 
          onClose={() => setSelectedComponent(null)} 
        />
      )}

      {/* Mobile info */}
      <div className="absolute bottom-4 right-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700 md:hidden">
        <p className="text-xs text-slate-300">
          Touch to rotate • Pinch to zoom
        </p>
      </div>
    </div>
  );
};

// Add missing import
import { X } from 'lucide-react';
