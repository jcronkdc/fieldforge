import React, { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  Environment,
  Text,
  Box,
  Sphere,
  Line,
  Html,
  PerspectiveCamera,
  Sky,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';
import { 
  Users, 
  Truck, 
  Zap, 
  AlertTriangle,
  Radio,
  MapPin,
  Activity
} from 'lucide-react';

// Types for our 3D objects
interface CrewMember {
  id: string;
  name: string;
  role: string;
  position: [number, number, number];
  status: 'active' | 'idle' | 'break';
  team: string;
}

interface Equipment {
  id: string;
  name: string;
  type: 'truck' | 'crane' | 'generator' | 'tool';
  position: [number, number, number];
  status: 'operational' | 'maintenance' | 'offline';
}

interface PowerLine {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  voltage: number;
  status: 'energized' | 'de-energized' | 'testing';
}

interface TelemetryData {
  temperature: number;
  windSpeed: number;
  activeCrews: number;
  safetyScore: number;
  powerOutput: number;
}

// Animated crew member component
function CrewMemberModel({ member }: { member: CrewMember }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && member.status === 'active') {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + member.id.charCodeAt(0)) * 0.1 + 0.5;
    }
  });

  const color = member.status === 'active' ? '#3B82F6' : 
                member.status === 'idle' ? '#F59E0B' : '#6B7280';

  return (
    <group position={member.position}>
      <Sphere ref={meshRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </Sphere>
      <Html distanceFactor={10} position={[0, 1, 0]}>
        <div className="bg-slate-900/90 px-2 py-1 rounded text-white text-xs whitespace-nowrap backdrop-blur-sm border border-blue-500/30">
          <div className="font-semibold">{member.name}</div>
          <div className="text-blue-400 text-[10px]">{member.role}</div>
        </div>
      </Html>
    </group>
  );
}

// Equipment model component
function EquipmentModel({ equipment }: { equipment: Equipment }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && equipment.status === 'operational') {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const color = equipment.status === 'operational' ? '#10B981' : 
                equipment.status === 'maintenance' ? '#F59E0B' : '#EF4444';

  return (
    <group ref={meshRef} position={equipment.position}>
      <Box args={[1, 0.8, 1.5]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Box>
      {equipment.type === 'truck' && (
        <>
          <Box position={[0, -0.5, 0]} args={[0.3, 0.3, 0.3]}>
            <meshStandardMaterial color="#1F2937" />
          </Box>
          <Box position={[0.5, -0.5, 0.5]} args={[0.3, 0.3, 0.3]}>
            <meshStandardMaterial color="#1F2937" />
          </Box>
          <Box position={[-0.5, -0.5, 0.5]} args={[0.3, 0.3, 0.3]}>
            <meshStandardMaterial color="#1F2937" />
          </Box>
          <Box position={[0.5, -0.5, -0.5]} args={[0.3, 0.3, 0.3]}>
            <meshStandardMaterial color="#1F2937" />
          </Box>
          <Box position={[-0.5, -0.5, -0.5]} args={[0.3, 0.3, 0.3]}>
            <meshStandardMaterial color="#1F2937" />
          </Box>
        </>
      )}
      <Html distanceFactor={10} position={[0, 1.5, 0]}>
        <div className="bg-slate-900/90 px-2 py-1 rounded text-white text-xs whitespace-nowrap backdrop-blur-sm border border-green-500/30">
          <div className="font-semibold flex items-center gap-1">
            <Truck className="w-3 h-3" />
            {equipment.name}
          </div>
          <div className={`text-[10px] ${
            equipment.status === 'operational' ? 'text-green-400' :
            equipment.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {equipment.status.toUpperCase()}
          </div>
        </div>
      </Html>
    </group>
  );
}

// Power line component
function PowerLineModel({ line }: { line: PowerLine }) {
  const points = useMemo(() => [
    new THREE.Vector3(...line.start),
    new THREE.Vector3(...line.end)
  ], [line.start, line.end]);

  const color = line.status === 'energized' ? '#FF6B6B' : 
                line.status === 'de-energized' ? '#6B7280' : '#F59E0B';

  return (
    <>
      <Line
        points={points}
        color={color}
        lineWidth={3}
        dashed={line.status === 'testing'}
        dashScale={0.5}
        dashSize={1}
        gapSize={0.5}
      />
      {/* Power towers */}
      <group position={line.start}>
        <Box args={[0.3, 8, 0.3]} position={[0, 4, 0]}>
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
        </Box>
      </group>
      <group position={line.end}>
        <Box args={[0.3, 8, 0.3]} position={[0, 4, 0]}>
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
        </Box>
      </group>
    </>
  );
}

// Substation component
function SubstationModel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Main building */}
      <Box args={[8, 3, 6]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.4} />
      </Box>
      {/* Transformers */}
      <Box args={[1.5, 2, 1.5]} position={[-2, 1, -2]}>
        <meshStandardMaterial color="#6B7280" metalness={0.8} />
      </Box>
      <Box args={[1.5, 2, 1.5]} position={[2, 1, -2]}>
        <meshStandardMaterial color="#6B7280" metalness={0.8} />
      </Box>
      {/* Control panel */}
      <Box args={[0.1, 1.5, 3]} position={[-3.9, 1.5, 0]}>
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.5} />
      </Box>
      <Html distanceFactor={10} position={[0, 4, 0]}>
        <div className="bg-slate-900/90 px-3 py-2 rounded text-white text-sm backdrop-blur-sm border border-purple-500/30">
          <div className="font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Main Substation
          </div>
          <div className="text-green-400 text-xs">ONLINE • 115kV</div>
        </div>
      </Html>
    </group>
  );
}

// Main ProjectMap3D component
export const ProjectMap3D: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'crew' | 'equipment'>('overview');

  // Mock data - in production, this would come from real-time APIs
  const [telemetry] = useState<TelemetryData>({
    temperature: 72,
    windSpeed: 12,
    activeCrews: 4,
    safetyScore: 98,
    powerOutput: 85
  });

  const crews: CrewMember[] = [
    { id: '1', name: 'John Smith', role: 'Lineman', position: [-5, 0, -5], status: 'active', team: 'Alpha' },
    { id: '2', name: 'Sarah Johnson', role: 'Foreman', position: [-3, 0, -5], status: 'active', team: 'Alpha' },
    { id: '3', name: 'Mike Chen', role: 'Safety', position: [5, 0, 3], status: 'idle', team: 'Beta' },
    { id: '4', name: 'Lisa Brown', role: 'Engineer', position: [0, 0, 0], status: 'active', team: 'Beta' },
  ];

  const equipment: Equipment[] = [
    { id: 'e1', name: 'Bucket Truck 01', type: 'truck', position: [-8, 0, -8], status: 'operational' },
    { id: 'e2', name: 'Service Truck 02', type: 'truck', position: [8, 0, 8], status: 'maintenance' },
    { id: 'e3', name: 'Generator Unit', type: 'generator', position: [10, 0, -5], status: 'operational' },
  ];

  const powerLines: PowerLine[] = [
    { id: 'p1', start: [-15, 0, -15], end: [0, 0, 0], voltage: 115, status: 'energized' },
    { id: 'p2', start: [0, 0, 0], end: [15, 0, 15], voltage: 115, status: 'de-energized' },
    { id: 'p3', start: [-10, 0, 10], end: [10, 0, -10], voltage: 34.5, status: 'testing' },
  ];

  return (
    <div className="h-full w-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Site Overview
          </h3>
          <div className="flex gap-2">
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
              onClick={() => setViewMode('crew')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === 'crew' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Crews
            </button>
            <button
              onClick={() => setViewMode('equipment')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === 'equipment' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Equipment
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <h4 className="text-white font-semibold mb-2 text-sm">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Active Crew</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-300">Operational Equipment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500"></div>
              <span className="text-slate-300">Energized Line</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500"></div>
              <span className="text-slate-300">De-energized Line</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Overlay */}
      {showTelemetry && (
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <div className="flex items-center gap-2 text-white">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm">Active Crews:</span>
              <span className="font-bold">{telemetry.activeCrews}</span>
            </div>
          </div>
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <div className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-4 h-4 text-green-400" />
              <span className="text-sm">Safety Score:</span>
              <span className="font-bold">{telemetry.safetyScore}%</span>
            </div>
          </div>
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <div className="flex items-center gap-2 text-white">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Power Output:</span>
              <span className="font-bold">{telemetry.powerOutput}MW</span>
            </div>
          </div>
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <div className="flex items-center gap-2 text-white">
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Wind Speed:</span>
              <span className="font-bold">{telemetry.windSpeed}mph</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Telemetry Button */}
      <button
        onClick={() => setShowTelemetry(!showTelemetry)}
        className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 text-white hover:bg-slate-700 transition-colors"
      >
        {showTelemetry ? 'Hide' : 'Show'} Telemetry
      </button>

      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={60} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={50}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1}
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#3B82F6" />
        
        {/* Environment */}
        <Sky sunPosition={[100, 20, 100]} />
        <fog attach="fog" args={['#0f172a', 30, 80]} />
        
        {/* Ground */}
        <Grid 
          args={[50, 50]} 
          cellSize={2}
          cellThickness={0.5}
          cellColor="#374151"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#4B5563"
          fadeDistance={50}
          fadeStrength={1}
          infiniteGrid={true}
        />
        
        <Suspense fallback={null}>
          {/* Substation */}
          <SubstationModel position={[0, 0, 0]} />
          
          {/* Power Lines */}
          {(viewMode === 'overview' || viewMode === 'equipment') && 
            powerLines.map(line => (
              <PowerLineModel key={line.id} line={line} />
            ))
          }
          
          {/* Crew Members */}
          {(viewMode === 'overview' || viewMode === 'crew') && 
            crews.map(member => (
              <CrewMemberModel key={member.id} member={member} />
            ))
          }
          
          {/* Equipment */}
          {(viewMode === 'overview' || viewMode === 'equipment') && 
            equipment.map(eq => (
              <EquipmentModel key={eq.id} equipment={eq} />
            ))
          }
        </Suspense>
      </Canvas>

      {/* Mobile Controls Info */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700 md:hidden">
        <p className="text-xs text-slate-300">
          Touch to rotate • Pinch to zoom • Two fingers to pan
        </p>
      </div>
    </div>
  );
};
