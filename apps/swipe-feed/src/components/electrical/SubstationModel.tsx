import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Zap, AlertTriangle, Thermometer, Shield, Wrench,
  Eye, EyeOff, ZoomIn, ZoomOut, RotateCw, Info,
  Activity, Camera, Download, Settings, Play, Pause,
  Maximize, Navigation, Lock, Unlock, CheckCircle
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, PerspectiveCamera, Box, Cylinder,
  Text, Html, Line, Sphere, Environment, 
  MeshTransmissionMaterial, Float, GradientTexture
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as THREE from 'three';

interface Equipment {
  id: string;
  name: string;
  type: 'transformer' | 'breaker' | 'switch' | 'bus' | 'insulator' | 'arrester';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  voltage: number; // kV
  temperature: number; // Celsius
  status: 'energized' | 'de-energized' | 'grounded' | 'maintenance';
  specifications: {
    manufacturer: string;
    model: string;
    rating: string;
    installDate: string;
  };
}

interface Clearance {
  equipment1: string;
  equipment2: string;
  distance: number; // meters
  required: number; // meters per voltage class
  safe: boolean;
}

interface MaintenancePath {
  id: string;
  name: string;
  points: { x: number; y: number; z: number }[];
  accessible: boolean;
}

interface ViewMode {
  id: string;
  name: string;
  icon: React.ElementType;
}

// 3D Components
function Transformer({ equipment, selected, onSelect }: {
  equipment: Equipment;
  selected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && equipment.status === 'energized') {
      // Subtle vibration for energized equipment
      meshRef.current.position.y = equipment.position.y + Math.sin(state.clock.elapsedTime * 10) * 0.002;
    }
  });

  const getColor = () => {
    if (equipment.status === 'energized') return '#10b981';
    if (equipment.status === 'de-energized') return '#6b7280';
    if (equipment.status === 'grounded') return '#3b82f6';
    return '#f59e0b'; // maintenance
  };

  const emissiveIntensity = equipment.status === 'energized' ? 0.5 : 0;

  return (
    <group 
      position={[equipment.position.x, equipment.position.y, equipment.position.z]}
      rotation={[equipment.rotation.x, equipment.rotation.y, equipment.rotation.z]}
    >
      {/* Main transformer body */}
      <Box
        ref={meshRef}
        args={[4, 5, 3]}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={getColor()} 
          emissive={getColor()} 
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      {/* Cooling fins */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          args={[0.1, 4, 2.5]}
          position={[-2.2 + i * 0.4, 0, 0]}
        >
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.3} />
        </Box>
      ))}

      {/* Bushings */}
      {[-1, 0, 1].map((x) => (
        <group key={x} position={[x, 2.5, 0]}>
          <Cylinder args={[0.3, 0.3, 1]}>
            <meshStandardMaterial color="#8b5a2b" />
          </Cylinder>
          <Sphere args={[0.4]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </Sphere>
        </group>
      ))}

      {/* Selection indicator */}
      {(selected || hovered) && (
        <Box args={[5, 6, 4]} position={[0, 0, 0]}>
          <meshBasicMaterial color={selected ? '#f59e0b' : '#fff'} wireframe opacity={0.3} transparent />
        </Box>
      )}

      {/* Info popup */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900 text-white p-[8px] rounded-[8px] text-xs whitespace-nowrap">
            <div className="font-bold">{equipment.name}</div>
            <div className="text-slate-400">{equipment.voltage}kV {equipment.type}</div>
            <div className="flex items-center gap-[5px]">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>{equipment.temperature}°C</span>
            </div>
            <div className={`text-${equipment.status === 'energized' ? 'green' : 'gray'}-400`}>
              {equipment.status.toUpperCase()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Breaker({ equipment, selected, onSelect }: {
  equipment: Equipment;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isOpen = equipment.status === 'de-energized';

  return (
    <group 
      position={[equipment.position.x, equipment.position.y, equipment.position.z]}
      rotation={[equipment.rotation.x, equipment.rotation.y, equipment.rotation.z]}
    >
      {/* Breaker tank */}
      <Cylinder
        args={[1.5, 1.5, 3]}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color="#475569" 
          metalness={0.9} 
          roughness={0.2} 
        />
      </Cylinder>

      {/* Insulators */}
      {[-1.5, 1.5].map((y) => (
        <Cylinder key={y} args={[0.4, 0.3, 2]} position={[0, y, 0]}>
          <meshStandardMaterial color="#8b5a2b" />
        </Cylinder>
      ))}

      {/* Contact indicator */}
      <Box args={[0.3, isOpen ? 0.1 : 2, 0.3]} position={[0, 0, 1.5]}>
        <meshStandardMaterial 
          color={isOpen ? '#ef4444' : '#10b981'} 
          emissive={isOpen ? '#ef4444' : '#10b981'}
          emissiveIntensity={0.5}
        />
      </Box>

      {/* Status light */}
      <Sphere args={[0.2]} position={[0, 2, 0]}>
        <meshStandardMaterial 
          color={equipment.status === 'energized' ? '#10b981' : '#ef4444'}
          emissive={equipment.status === 'energized' ? '#10b981' : '#ef4444'}
          emissiveIntensity={2}
        />
      </Sphere>

      {(selected || hovered) && (
        <Cylinder args={[2, 2, 4]} position={[0, 0, 0]}>
          <meshBasicMaterial color={selected ? '#f59e0b' : '#fff'} wireframe opacity={0.3} transparent />
        </Cylinder>
      )}
    </group>
  );
}

function Bus({ equipment }: { equipment: Equipment }) {
  const points = [
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(10, 0, 0)
  ];

  return (
    <group 
      position={[equipment.position.x, equipment.position.y, equipment.position.z]}
      rotation={[equipment.rotation.x, equipment.rotation.y, equipment.rotation.z]}
    >
      {/* Main conductor */}
      <Cylinder args={[0.2, 0.2, 20]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial 
          color={equipment.status === 'energized' ? '#d4d4d8' : '#71717a'}
          metalness={0.95}
          roughness={0.05}
        />
      </Cylinder>

      {/* Support insulators */}
      {[-8, -4, 0, 4, 8].map((x) => (
        <group key={x} position={[x, -2, 0]}>
          <Cylinder args={[0.3, 0.4, 2]} position={[0, 1, 0]}>
            <meshStandardMaterial color="#8b5a2b" />
          </Cylinder>
          <Box args={[1, 0.5, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#374151" />
          </Box>
        </group>
      ))}

      {/* Voltage glow effect */}
      {equipment.status === 'energized' && (
        <Cylinder args={[0.5, 0.5, 20]} rotation={[0, 0, Math.PI / 2]}>
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.2}
          />
        </Cylinder>
      )}
    </group>
  );
}

function ClearanceLine({ clearance }: { clearance: Clearance }) {
  const color = clearance.safe ? '#10b981' : '#ef4444';
  
  return (
    <group>
      <Html center position={[0, 2, 0]}>
        <div className={`text-xs px-2 py-1 rounded ${
          clearance.safe ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {clearance.distance.toFixed(2)}m / {clearance.required.toFixed(2)}m
        </div>
      </Html>
    </group>
  );
}

function HeatMap({ equipment }: { equipment: Equipment[] }) {
  return (
    <>
      {equipment.map((eq) => {
        const heatIntensity = eq.temperature / 100; // Normalize to 0-1
        const color = new THREE.Color().setHSL(0.1 - heatIntensity * 0.1, 1, 0.5);
        
        return (
          <Sphere
            key={eq.id}
            args={[3, 16, 16]}
            position={[eq.position.x, eq.position.y, eq.position.z]}
          >
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </Sphere>
        );
      })}
    </>
  );
}

function Scene({ 
  equipment, 
  selectedId, 
  onSelectEquipment,
  viewMode,
  showPaths,
  showHeatMap,
  clearances
}: {
  equipment: Equipment[];
  selectedId: string | null;
  onSelectEquipment: (id: string) => void;
  viewMode: string;
  showPaths: boolean;
  showHeatMap: boolean;
  clearances: Clearance[];
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[30, 20, 30]} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={100}
        minDistance={5}
        target={[0, 5, 0]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 10]} intensity={1} castShadow />
      <pointLight position={[-20, 20, -20]} intensity={0.5} color="#f59e0b" />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* Ground */}
      <Box args={[100, 0.1, 100]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial color="#1e293b" />
      </Box>
      
      {/* Grid for scale reference */}
      <gridHelper args={[100, 20, '#374151', '#1e293b']} />

      {/* Equipment rendering */}
      {equipment.map((eq) => {
        switch (eq.type) {
          case 'transformer':
            return (
              <Transformer
                key={eq.id}
                equipment={eq}
                selected={selectedId === eq.id}
                onSelect={() => onSelectEquipment(eq.id)}
              />
            );
          case 'breaker':
            return (
              <Breaker
                key={eq.id}
                equipment={eq}
                selected={selectedId === eq.id}
                onSelect={() => onSelectEquipment(eq.id)}
              />
            );
          case 'bus':
            return <Bus key={eq.id} equipment={eq} />;
          default:
            return null;
        }
      })}

      {/* Clearance lines */}
      {viewMode === 'clearance' && clearances.map((cl, i) => (
        <ClearanceLine key={i} clearance={cl} />
      ))}

      {/* Heat map overlay */}
      {showHeatMap && <HeatMap equipment={equipment} />}

      {/* Maintenance paths */}
      {showPaths && (
        <>
          <Line
            points={[[-20, 0.1, -20], [-20, 0.1, 20], [20, 0.1, 20], [20, 0.1, -20]]}
            color="#3b82f6"
            lineWidth={3}
            dashed
          />
          <Line
            points={[[0, 0.1, -20], [0, 0.1, 20]]}
            color="#10b981"
            lineWidth={2}
            dashed
          />
        </>
      )}
    </>
  );
}

export const SubstationModel: React.FC = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('standard');
  const [showPaths, setShowPaths] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const viewModes: ViewMode[] = [
    { id: 'standard', name: 'Standard', icon: Eye },
    { id: 'clearance', name: 'Clearances', icon: Shield },
    { id: 'thermal', name: 'Thermal', icon: Thermometer },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
    { id: 'voltage', name: 'Voltage', icon: Zap }
  ];

  // Mock data
  useEffect(() => {
    const mockEquipment: Equipment[] = [
      {
        id: '1',
        name: 'T1 - Main Transformer',
        type: 'transformer',
        position: { x: 0, y: 2.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        voltage: 138,
        temperature: 65,
        status: 'energized',
        specifications: {
          manufacturer: 'ABB',
          model: 'TrafoStar 500',
          rating: '50 MVA',
          installDate: '2020-06-15'
        }
      },
      {
        id: '2',
        name: 'CB1 - Line Breaker',
        type: 'breaker',
        position: { x: -10, y: 1.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        voltage: 138,
        temperature: 45,
        status: 'energized',
        specifications: {
          manufacturer: 'Siemens',
          model: '3AP1 FG',
          rating: '145kV/3150A',
          installDate: '2020-06-20'
        }
      },
      {
        id: '3',
        name: 'CB2 - Tie Breaker',
        type: 'breaker',
        position: { x: 10, y: 1.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        voltage: 138,
        temperature: 42,
        status: 'de-energized',
        specifications: {
          manufacturer: 'GE',
          model: 'GL314',
          rating: '145kV/3150A',
          installDate: '2020-06-20'
        }
      },
      {
        id: '4',
        name: 'Bus 1 - Main Bus',
        type: 'bus',
        position: { x: 0, y: 6, z: -10 },
        rotation: { x: 0, y: 0, z: 0 },
        voltage: 138,
        temperature: 35,
        status: 'energized',
        specifications: {
          manufacturer: 'Southwire',
          model: 'ACSR 795',
          rating: '138kV',
          installDate: '2020-05-10'
        }
      }
    ];

    setEquipment(mockEquipment);
    
    // Calculate clearances
    const mockClearances: Clearance[] = [
      {
        equipment1: '1',
        equipment2: '2',
        distance: 10,
        required: 3.05, // 138kV phase-to-ground
        safe: true
      },
      {
        equipment1: '1',
        equipment2: '3',
        distance: 10,
        required: 3.05,
        safe: true
      },
      {
        equipment1: '1',
        equipment2: '4',
        distance: 7.5,
        required: 3.66, // 138kV phase-to-phase
        safe: true
      }
    ];

    setClearances(mockClearances);
    setLoading(false);
  }, []);

  const handleSelectEquipment = (id: string) => {
    setSelectedEquipment(selectedEquipment === id ? null : id);
  };

  const handleLockOut = () => {
    if (!selectedEquipment) return;
    
    const eq = equipment.find(e => e.id === selectedEquipment);
    if (!eq) return;

    const newStatus = eq.status === 'energized' ? 'de-energized' : 'maintenance';
    
    setEquipment(prev => prev.map(e => 
      e.id === selectedEquipment ? { ...e, status: newStatus } : e
    ));
    
    toast.success(`${eq.name} ${newStatus === 'maintenance' ? 'locked out' : 'status changed'}`);
  };

  const handleExport = () => {
    toast.success('3D model exported');
  };

  const selected = equipment.find(e => e.id === selectedEquipment);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-amber-500">Loading substation model...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-900">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas shadows>
          <Suspense fallback={null}>
            <Scene 
              equipment={equipment}
              selectedId={selectedEquipment}
              onSelectEquipment={handleSelectEquipment}
              viewMode={viewMode}
              showPaths={showPaths}
              showHeatMap={showHeatMap || viewMode === 'thermal'}
              clearances={clearances}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-[21px] bg-gradient-to-b from-slate-900 via-slate-900/90 to-transparent pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-[13px]">
            <Zap className="w-7 h-7 text-amber-400" />
            Substation 3D Model
          </h1>
          
          <div className="flex items-center gap-[13px]">
            <button
              onClick={handleLockOut}
              disabled={!selectedEquipment}
              className="px-[21px] py-[8px] bg-red-500 hover:bg-red-600 disabled:bg-slate-700 text-white rounded-[8px] font-medium transition-all flex items-center gap-[8px]"
            >
              <Lock className="w-5 h-5" />
              Lock Out
            </button>
            
            <button
              onClick={handleExport}
              className="p-[8px] bg-slate-800/80 hover:bg-slate-700 text-white rounded-[8px] transition-all"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="absolute top-[89px] left-[21px] bg-slate-800/90 backdrop-blur-sm rounded-[13px] p-[13px]">
        <div className="flex gap-[5px]">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`p-[8px] rounded-[8px] transition-all ${
                  viewMode === mode.id
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
                title={mode.name}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-[21px] left-[21px] bg-slate-800/90 backdrop-blur-sm rounded-[13px] p-[13px]">
        <div className="flex gap-[13px]">
          <button
            onClick={() => setShowPaths(!showPaths)}
            className={`px-[13px] py-[8px] rounded-[8px] text-sm font-medium transition-all flex items-center gap-[8px] ${
              showPaths
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Navigation className="w-4 h-4" />
            Paths
          </button>
          
          <button
            onClick={() => setShowHeatMap(!showHeatMap)}
            className={`px-[13px] py-[8px] rounded-[8px] text-sm font-medium transition-all flex items-center gap-[8px] ${
              showHeatMap
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            Heat
          </button>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`px-[13px] py-[8px] rounded-[8px] text-sm font-medium transition-all flex items-center gap-[8px] ${
              showInfo
                ? 'bg-slate-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Info className="w-4 h-4" />
            Info
          </button>
        </div>
      </div>

      {/* Equipment Details Panel */}
      <AnimatePresence>
        {showInfo && selected && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-[21px] top-[89px] bg-slate-800/90 backdrop-blur-sm rounded-[13px] p-[21px] w-[300px]"
          >
            <h3 className="text-lg font-semibold text-white mb-[13px] flex items-center gap-[8px]">
              {selected.type === 'transformer' && <Activity className="w-5 h-5 text-amber-400" />}
              {selected.type === 'breaker' && <Zap className="w-5 h-5 text-blue-400" />}
              {selected.name}
            </h3>
            
            <div className="space-y-[13px]">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Status</span>
                <span className={`text-sm font-medium capitalize ${
                  selected.status === 'energized' ? 'text-green-400' :
                  selected.status === 'de-energized' ? 'text-gray-400' :
                  selected.status === 'grounded' ? 'text-blue-400' :
                  'text-amber-400'
                }`}>
                  {selected.status}
                </span>
              </div>

              {/* Voltage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Voltage</span>
                <span className="text-sm font-medium text-white">{selected.voltage} kV</span>
              </div>

              {/* Temperature */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Temperature</span>
                <span className={`text-sm font-medium ${
                  selected.temperature > 80 ? 'text-red-400' :
                  selected.temperature > 60 ? 'text-amber-400' :
                  'text-green-400'
                }`}>
                  {selected.temperature}°C
                </span>
              </div>

              <div className="pt-[13px] border-t border-slate-700">
                <h4 className="text-sm font-medium text-white mb-[8px]">Specifications</h4>
                <div className="space-y-[5px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Manufacturer</span>
                    <span className="text-slate-300">{selected.specifications.manufacturer}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Model</span>
                    <span className="text-slate-300">{selected.specifications.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Rating</span>
                    <span className="text-slate-300">{selected.specifications.rating}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Install Date</span>
                    <span className="text-slate-300">
                      {new Date(selected.specifications.installDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clearance Info */}
              {viewMode === 'clearance' && (
                <div className="pt-[13px] border-t border-slate-700">
                  <h4 className="text-sm font-medium text-white mb-[8px]">Clearances</h4>
                  <div className="space-y-[5px]">
                    {clearances
                      .filter(c => c.equipment1 === selected.id || c.equipment2 === selected.id)
                      .map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            To {c.equipment1 === selected.id ? c.equipment2 : c.equipment1}
                          </span>
                          <span className={c.safe ? 'text-green-400' : 'text-red-400'}>
                            {c.distance.toFixed(2)}m ({c.safe ? 'Safe' : 'Warning'})
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Warnings */}
      <AnimatePresence>
        {clearances.some(c => !c.safe) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-[21px] right-[21px] bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-[13px] p-[13px] max-w-[300px]"
          >
            <div className="flex items-start gap-[8px]">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="text-sm text-red-400">
                <p className="font-medium">Clearance Warning</p>
                <p className="text-xs mt-[3px]">
                  Some equipment clearances are below minimum safe distances.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
