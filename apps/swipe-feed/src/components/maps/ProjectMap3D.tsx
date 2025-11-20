import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Map, Navigation, Users, Truck, AlertTriangle, Cloud,
  Layers, ZoomIn, ZoomOut, Compass, Eye, EyeOff,
  Play, Pause, RotateCw, Maximize, Settings, Download,
  Activity, Crosshair, Shield, Clock, MapPin, Camera
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, PerspectiveCamera, Grid, Sky,
  Text, Box, Sphere, Line, Html, Environment
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthContext } from '../auth/AuthProvider';
import * as THREE from 'three';

interface Equipment {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  status: 'active' | 'idle' | 'maintenance';
  operator: string;
  lastUpdate: string;
  path: { x: number; y: number; z: number }[];
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  position: { x: number; y: number; z: number };
  status: 'active' | 'break' | 'offline';
  zone: string;
  heartRate?: number;
  lastUpdate: string;
}

interface SafetyZone {
  id: string;
  name: string;
  type: 'restricted' | 'caution' | 'safe';
  bounds: { x: number; z: number; width: number, depth: number };
  height: number;
  active: boolean;
}

interface MapLayer {
  id: string;
  name: string;
  type: 'equipment' | 'crew' | 'safety' | 'weather' | 'progress' | 'drone';
  visible: boolean;
  icon: React.ElementType;
}

// 3D Components
function EquipmentMarker({ equipment }: { equipment: Equipment }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && equipment.status === 'active') {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = equipment.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const color = equipment.status === 'active' ? '#10b981' : 
                equipment.status === 'idle' ? '#f59e0b' : '#ef4444';

  return (
    <group position={[equipment.position.x, equipment.position.y, equipment.position.z]}>
      <Box
        ref={meshRef}
        args={[2, 3, 2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={color} />
      </Box>
      
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900 text-white p-[8px] rounded-[8px] text-xs whitespace-nowrap">
            <div className="font-bold">{equipment.name}</div>
            <div className="text-slate-400">{equipment.type}</div>
            <div className="text-slate-400">Operator: {equipment.operator}</div>
            <div className={`text-${equipment.status === 'active' ? 'green' : equipment.status === 'idle' ? 'yellow' : 'red'}-400`}>
              {equipment.status.toUpperCase()}
            </div>
          </div>
        </Html>
      )}

      {/* Equipment Path */}
      {equipment.path.length > 1 && (
        <Line
          points={equipment.path.map(p => [p.x, p.y, p.z])}
          color={color}
          lineWidth={2}
          dashed
          dashScale={10}
          opacity={0.5}
        />
      )}
    </group>
  );
}

function CrewMarker({ crew }: { crew: CrewMember }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && crew.status === 'active') {
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const color = crew.status === 'active' ? '#3b82f6' : 
                crew.status === 'break' ? '#f59e0b' : '#6b7280';

  return (
    <group position={[crew.position.x, crew.position.y + 1, crew.position.z]}>
      <Sphere
        ref={meshRef}
        args={[0.5, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Vertical beam */}
      <Box args={[0.1, 10, 0.1]} position={[0, -5, 0]}>
        <meshBasicMaterial color={color} opacity={0.3} transparent />
      </Box>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900 text-white p-[8px] rounded-[8px] text-xs whitespace-nowrap">
            <div className="font-bold">{crew.name}</div>
            <div className="text-slate-400">{crew.role}</div>
            <div className="text-slate-400">Zone: {crew.zone}</div>
            {crew.heartRate && (
              <div className="text-red-400">HR: {crew.heartRate} bpm</div>
            )}
            <div className={`text-${crew.status === 'active' ? 'blue' : crew.status === 'break' ? 'yellow' : 'gray'}-400`}>
              {crew.status.toUpperCase()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function SafetyZoneBox({ zone }: { zone: SafetyZone }) {
  const color = zone.type === 'restricted' ? '#ef4444' : 
                zone.type === 'caution' ? '#f59e0b' : '#10b981';
  
  const opacity = zone.type === 'restricted' ? 0.3 : 0.2;

  return (
    <group position={[zone.bounds.x, zone.height / 2, zone.bounds.z]}>
      {/* Zone boundary */}
      <Box args={[zone.bounds.width, zone.height, zone.bounds.depth]}>
        <meshStandardMaterial 
          color={color} 
          opacity={opacity} 
          transparent 
          side={THREE.DoubleSide}
        />
      </Box>
      
      {/* Zone label */}
      <Text
        position={[0, zone.height / 2 + 1, 0]}
        fontSize={2}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {zone.name}
      </Text>

      {/* Grid lines on ground */}
      <gridHelper 
        args={[Math.max(zone.bounds.width, zone.bounds.depth), 10, color, color]} 
        position={[0, -zone.height / 2, 0]}
        material-opacity={0.5}
        material-transparent
      />
    </group>
  );
}

function Scene({ equipment, crew, zones, layers }: {
  equipment: Equipment[];
  crew: CrewMember[];
  zones: SafetyZone[];
  layers: MapLayer[];
}) {
  const { camera } = useThree();

  return (
    <>
      <PerspectiveCamera makeDefault position={[50, 50, 50]} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={200}
        minDistance={10}
        maxPolarAngle={Math.PI / 2.2}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 50, 25]} intensity={1} castShadow />
      <pointLight position={[-50, 20, -50]} intensity={0.5} color="#f59e0b" />
      
      {/* Sky and Environment */}
      <Sky sunPosition={[100, 20, 100]} />
      <fog attach="fog" args={['#e0f2fe', 100, 500]} />
      
      {/* Ground Grid */}
      <Grid
        infiniteGrid
        args={[100, 100]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={50}
        sectionThickness={1.5}
        sectionColor="#3b82f6"
        fadeDistance={300}
        fadeStrength={1}
      />
      
      {/* Site Boundary */}
      <Box args={[200, 0.1, 200]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>

      {/* Equipment Layer */}
      {layers.find(l => l.id === 'equipment')?.visible && equipment.map(eq => (
        <EquipmentMarker key={eq.id} equipment={eq} />
      ))}

      {/* Crew Layer */}
      {layers.find(l => l.id === 'crew')?.visible && crew.map(member => (
        <CrewMarker key={member.id} crew={member} />
      ))}

      {/* Safety Zones Layer */}
      {layers.find(l => l.id === 'safety')?.visible && zones.filter(z => z.active).map(zone => (
        <SafetyZoneBox key={zone.id} zone={zone} />
      ))}
    </>
  );
}

export const ProjectMap3D: React.FC = () => {
  const { user } = useAuthContext();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'top' | 'side'>('3d');
  
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'equipment', name: 'Equipment', type: 'equipment', visible: true, icon: Truck },
    { id: 'crew', name: 'Crew', type: 'crew', visible: true, icon: Users },
    { id: 'safety', name: 'Safety Zones', type: 'safety', visible: true, icon: Shield },
    { id: 'weather', name: 'Weather', type: 'weather', visible: false, icon: Cloud },
    { id: 'progress', name: 'Progress', type: 'progress', visible: false, icon: Activity },
    { id: 'drone', name: 'Drone View', type: 'drone', visible: false, icon: Camera }
  ]);

  // Mock data for demonstration
  useEffect(() => {
    // In production, fetch from API
    setEquipment([
      {
        id: '1',
        name: 'Crane 01',
        type: 'Tower Crane',
        position: { x: 20, y: 0, z: 20 },
        status: 'active',
        operator: 'John Smith',
        lastUpdate: new Date().toISOString(),
        path: [
          { x: 20, y: 0, z: 20 },
          { x: 30, y: 0, z: 20 },
          { x: 30, y: 0, z: 30 },
          { x: 20, y: 0, z: 30 },
          { x: 20, y: 0, z: 20 }
        ]
      },
      {
        id: '2',
        name: 'Excavator 03',
        type: 'Excavator',
        position: { x: -30, y: 0, z: -20 },
        status: 'idle',
        operator: 'Mike Johnson',
        lastUpdate: new Date().toISOString(),
        path: []
      },
      {
        id: '3',
        name: 'Dozer 02',
        type: 'Bulldozer',
        position: { x: 0, y: 0, z: -40 },
        status: 'maintenance',
        operator: 'Sarah Wilson',
        lastUpdate: new Date().toISOString(),
        path: []
      }
    ]);

    setCrew([
      {
        id: '1',
        name: 'John Smith',
        role: 'Crane Operator',
        position: { x: 20, y: 10, z: 20 },
        status: 'active',
        zone: 'Zone A',
        heartRate: 72,
        lastUpdate: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Mike Johnson',
        role: 'Equipment Operator',
        position: { x: -30, y: 0, z: -20 },
        status: 'break',
        zone: 'Zone B',
        lastUpdate: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Sarah Wilson',
        role: 'Site Supervisor',
        position: { x: 10, y: 0, z: 10 },
        status: 'active',
        zone: 'Zone A',
        heartRate: 68,
        lastUpdate: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Tom Davis',
        role: 'Safety Officer',
        position: { x: -10, y: 0, z: 30 },
        status: 'active',
        zone: 'Zone C',
        lastUpdate: new Date().toISOString()
      }
    ]);

    setZones([
      {
        id: '1',
        name: 'Restricted - Crane Zone',
        type: 'restricted',
        bounds: { x: 20, z: 20, width: 30, depth: 30 },
        height: 20,
        active: true
      },
      {
        id: '2',
        name: 'Caution - Heavy Equipment',
        type: 'caution',
        bounds: { x: -30, z: -20, width: 40, depth: 40 },
        height: 10,
        active: true
      },
      {
        id: '3',
        name: 'Safe Assembly Area',
        type: 'safe',
        bounds: { x: 50, z: -30, width: 20, depth: 20 },
        height: 5,
        active: true
      }
    ]);

    setLoading(false);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Update equipment positions
      setEquipment(prev => prev.map(eq => {
        if (eq.status === 'active' && eq.path.length > 0) {
          // Simple movement along path
          const time = Date.now() / 5000;
          const index = Math.floor(time % eq.path.length);
          const nextIndex = (index + 1) % eq.path.length;
          const t = (time % 1);
          
          const currentPos = eq.path[index];
          const nextPos = eq.path[nextIndex];
          
          return {
            ...eq,
            position: {
              x: currentPos.x + (nextPos.x - currentPos.x) * t,
              y: 0,
              z: currentPos.z + (nextPos.z - currentPos.z) * t
            },
            lastUpdate: new Date().toISOString()
          };
        }
        return eq;
      }));

      // Update crew positions slightly
      setCrew(prev => prev.map(member => {
        if (member.status === 'active') {
          const offset = Math.sin(Date.now() / 2000) * 0.5;
          return {
            ...member,
            position: {
              ...member.position,
              x: member.position.x + offset,
              z: member.position.z + offset * 0.5
            },
            heartRate: member.heartRate ? 
              Math.round(68 + Math.random() * 8) : undefined,
            lastUpdate: new Date().toISOString()
          };
        }
        return member;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleExportMap = () => {
    // In production, this would export the 3D scene
    toast.success('Map exported successfully');
  };

  const handleEmergencyAlert = () => {
    toast.error('🚨 Emergency broadcast sent to all crew members');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-blue-500">Loading 3D map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-900">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas shadows camera={{ position: [50, 50, 50], fov: 60 }}>
          <Suspense fallback={null}>
            <Scene 
              equipment={equipment} 
              crew={crew} 
              zones={zones}
              layers={layers}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-[21px] bg-gradient-to-b from-slate-900 via-slate-900/90 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[21px]">
            <h1 className="text-2xl font-bold text-white flex items-center gap-[13px]">
              <Map className="w-7 h-7 text-blue-400" />
              Project Site Map
            </h1>
            
            <div className="flex items-center gap-[8px] bg-slate-800/80 backdrop-blur-sm rounded-[8px] p-[5px]">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-[8px] hover:bg-slate-700 rounded-[5px] transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>
              
              <div className="w-[1px] h-[21px] bg-slate-600" />
              
              <button
                onClick={() => setViewMode('3d')}
                className={`p-[8px] rounded-[5px] transition-all ${
                  viewMode === '3d' ? 'bg-blue-500 text-slate-900' : 'hover:bg-slate-700 text-white'
                }`}
              >
                <Eye className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setViewMode('top')}
                className={`p-[8px] rounded-[5px] transition-all ${
                  viewMode === 'top' ? 'bg-blue-500 text-slate-900' : 'hover:bg-slate-700 text-white'
                }`}
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[13px]">
            <button
              onClick={handleEmergencyAlert}
              className="px-[21px] py-[8px] bg-red-500 hover:bg-red-600 text-white rounded-[8px] font-medium transition-all flex items-center gap-[8px]"
            >
              <AlertTriangle className="w-5 h-5" />
              Emergency Alert
            </button>
            
            <button
              onClick={handleExportMap}
              className="p-[8px] bg-slate-800/80 hover:bg-slate-700 text-white rounded-[8px] transition-all"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-[8px] bg-slate-800/80 hover:bg-slate-700 text-white rounded-[8px] transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute left-[21px] top-[89px] bg-slate-800/90 backdrop-blur-sm rounded-[13px] p-[21px] w-[233px]"
          >
            <h3 className="text-white font-medium mb-[13px] flex items-center gap-[8px]">
              <Layers className="w-5 h-5 text-blue-400" />
              Map Layers
            </h3>
            
            <div className="space-y-[8px]">
              {layers.map(layer => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center gap-[8px] px-[13px] py-[8px] rounded-[8px] transition-all ${
                      layer.visible
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{layer.name}</span>
                    {layer.visible ? (
                      <Eye className="w-4 h-4 ml-auto" />
                    ) : (
                      <EyeOff className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-[21px] top-[89px] bg-slate-800/90 backdrop-blur-sm rounded-[13px] p-[21px] w-[233px]"
          >
            <h3 className="text-white font-medium mb-[13px]">Site Status</h3>
            
            <div className="space-y-[13px]">
              {/* Equipment Status */}
              <div className="p-[13px] bg-slate-700/50 rounded-[8px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="text-sm text-slate-300">Equipment</span>
                  <span className="text-sm font-medium text-white">{equipment.length}</span>
                </div>
                <div className="space-y-[5px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400">Active</span>
                    <span className="text-green-400">
                      {equipment.filter(e => e.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">Idle</span>
                    <span className="text-blue-400">
                      {equipment.filter(e => e.status === 'idle').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-400">Maintenance</span>
                    <span className="text-red-400">
                      {equipment.filter(e => e.status === 'maintenance').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Crew Status */}
              <div className="p-[13px] bg-slate-700/50 rounded-[8px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="text-sm text-slate-300">Crew On Site</span>
                  <span className="text-sm font-medium text-white">{crew.length}</span>
                </div>
                <div className="space-y-[5px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">Active</span>
                    <span className="text-blue-400">
                      {crew.filter(c => c.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">On Break</span>
                    <span className="text-blue-400">
                      {crew.filter(c => c.status === 'break').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Zones */}
              <div className="p-[13px] bg-slate-700/50 rounded-[8px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="text-sm text-slate-300">Safety Zones</span>
                  <span className="text-sm font-medium text-white">
                    {zones.filter(z => z.active).length}
                  </span>
                </div>
                <div className="space-y-[5px] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400">Restricted</span>
                    <span className="text-red-400">
                      {zones.filter(z => z.type === 'restricted' && z.active).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">Caution</span>
                    <span className="text-blue-400">
                      {zones.filter(z => z.type === 'caution' && z.active).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div className="mt-[21px] pt-[13px] border-t border-slate-700">
              <div className="flex items-center gap-[8px] text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Hint */}
      <div className="absolute bottom-[21px] left-1/2 transform -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm rounded-[8px] px-[21px] py-[8px] text-sm text-slate-300">
        <div className="flex items-center gap-[21px]">
          <span className="flex items-center gap-[8px]">
            <Compass className="w-4 h-4" />
            Drag to rotate
          </span>
          <span className="flex items-center gap-[8px]">
            <ZoomIn className="w-4 h-4" />
            Scroll to zoom
          </span>
          <span className="flex items-center gap-[8px]">
            <Navigation className="w-4 h-4" />
            Right-drag to pan
          </span>
        </div>
      </div>
    </div>
  );
};
