import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Trophy,
  Zap,
  Droplets,
  Trash2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Pause,
  Award,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { CampusStorage } from '../../services/storage';

interface PresidencyEcoPatrol3DProps {
  onExitGame: () => void;
  onPointsEarned: (pts: number, reason: string) => void;
}

// Procedural Web Audio Synth for game feel
class GameAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // initialized on first user gesture
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playFixAction() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now); // E4
    osc.frequency.setValueAtTime(440, now + 0.08); // A4
    osc.frequency.setValueAtTime(659.25, now + 0.16); // E5

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.2, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  }
}

interface Objective {
  id: string;
  title: string;
  locationName: string;
  resource: 'electricity' | 'water' | 'waste' | 'solar';
  x: number;
  z: number;
  radius: number;
  completed: boolean;
  savingsRupees: number;
  points: number;
  promptText: string;
}

export const PresidencyEcoPatrol3D: React.FC<PresidencyEcoPatrol3DProps> = ({
  onExitGame,
  onPointsEarned,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<GameAudio>(new GameAudio());

  // Game States: 'title' | 'playing' | 'paused' | 'victory' | 'gameover'
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'victory' | 'gameover'>('title');
  const [score, setScore] = useState<number>(0);
  const [rupeesSaved, setRupeesSaved] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90); // 90 seconds mission
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  // Objectives state
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: 'obj-blk-b',
      title: 'Cut Room 204 Empty Load',
      locationName: 'Academic Block B',
      resource: 'electricity',
      x: -24,
      z: -18,
      radius: 6,
      completed: false,
      savingsRupees: 360,
      points: 80,
      promptText: 'PRESS [SPACE] TO TOGGLE ROOM 204 MAIN SWITCH',
    },
    {
      id: 'obj-hst-b',
      title: 'Seal Cistern Water Leak',
      locationName: 'Hostel Boys Wing C',
      resource: 'water',
      x: 28,
      z: 22,
      radius: 6,
      completed: false,
      savingsRupees: 1440,
      points: 100,
      promptText: 'PRESS [SPACE] TO REPAIR BROKEN FLOAT VALVE',
    },
    {
      id: 'obj-solar-a',
      title: 'Activate Rooftop Solar PV',
      locationName: 'Academic Block A',
      resource: 'solar',
      x: -26,
      z: 20,
      radius: 6,
      completed: false,
      savingsRupees: 680,
      points: 90,
      promptText: 'PRESS [SPACE] TO ENGAGE SOLAR INVERTER GRID SYNC',
    },
    {
      id: 'obj-canteen',
      title: 'Collect Compostable Waste',
      locationName: 'University Canteen Mess',
      resource: 'waste',
      x: 18,
      z: -22,
      radius: 6,
      completed: false,
      savingsRupees: 320,
      points: 70,
      promptText: 'PRESS [SPACE] TO ROUTE SCRAPS TO BIOGAS PLANT',
    },
    {
      id: 'obj-lib',
      title: 'Curfew Lighting Shutoff',
      locationName: 'Central Library',
      resource: 'electricity',
      x: 4,
      z: 0,
      radius: 6,
      completed: false,
      savingsRupees: 280,
      points: 60,
      promptText: 'PRESS [SPACE] TO ACTIVATE PERIMETER NIGHT TIMERS',
    },
  ]);

  // Mutable Game Loop State
  const gameLoopRef = useRef({
    keys: { w: false, a: false, s: false, d: false, space: false },
    playerPos: new THREE.Vector3(0, 0, 10),
    playerAngle: 0,
    speed: 0,
    maxSpeed: 22,
    accel: 28,
    friction: 12,
    turnSpeed: 3.2,
    nearbyObjective: null as Objective | null,
    objectivesList: [] as Objective[],
    completedCount: 0,
    score: 0,
    rupeesSaved: 0,
    timeLeft: 90,
    state: 'title',
  });

  // Sync state to mutable loop
  useEffect(() => {
    gameLoopRef.current.objectivesList = objectives;
  }, [objectives]);

  useEffect(() => {
    gameLoopRef.current.state = gameState;
  }, [gameState]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL per Three.js guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Scene, Camera, Horizon Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1914); // Deep evening campus sky
    scene.fog = new THREE.FogExp2(0x0a1914, 0.012);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.5,
      300
    );
    camera.position.set(0, 20, 26);

    // 4. Studio Environment Reflection via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting: Warm Key Light + Cool Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0x6ee7b7, 0x064e3b, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfef08a, 2.0);
    keyLight.position.set(35, 50, 25);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 120;
      const d = 50;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // 6. Procedural Textures & Materials
    // Campus Ground Grid
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const gctx = groundCanvas.getContext('2d')!;
    gctx.fillStyle = '#063024';
    gctx.fillRect(0, 0, 512, 512);
    // Subtle campus grid lines
    gctx.strokeStyle = '#0a4233';
    gctx.lineWidth = 4;
    for (let i = 0; i < 512; i += 64) {
      gctx.beginPath();
      gctx.moveTo(i, 0);
      gctx.lineTo(i, 512);
      gctx.stroke();
      gctx.beginPath();
      gctx.moveTo(0, i);
      gctx.lineTo(512, i);
      gctx.stroke();
    }
    const groundTex = new THREE.CanvasTexture(groundCanvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(12, 12);
    groundTex.colorSpace = THREE.SRGBColorSpace;

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Campus Road Network
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const roadH = new THREE.Mesh(new THREE.PlaneGeometry(120, 6), roadMat);
    roadH.rotation.x = -Math.PI / 2;
    roadH.position.y = 0.02;
    scene.add(roadH);

    const roadV = new THREE.Mesh(new THREE.PlaneGeometry(6, 120), roadMat);
    roadV.rotation.x = -Math.PI / 2;
    roadV.position.y = 0.02;
    scene.add(roadV);

    // 7. Composite Procedural Buildings (3-12 parts per Three.js guidelines)
    const buildingGroup = new THREE.Group();

    const createProceduralBuilding = (
      name: string,
      x: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: number,
      roofColor: number,
      hasSolar: boolean = false
    ) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(x, 0, z);

      // Part 1: Main Structure Body
      const bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.65,
        metalness: 0.2,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
      body.position.y = h / 2;
      body.castShadow = !isSoftwareGl;
      body.receiveShadow = !isSoftwareGl;
      bGroup.add(body);

      // Part 2: Roof Trim & Parapet
      const roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.5,
        metalness: 0.4,
      });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.6, d + 0.6), roofMat);
      roof.position.y = h + 0.3;
      bGroup.add(roof);

      // Part 3: Entrance Portico
      const portico = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.3, h * 0.4, 2),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
      );
      portico.position.set(0, (h * 0.4) / 2, d / 2 + 0.8);
      bGroup.add(portico);

      // Part 4: Emissive Glass Windows (Horizontal Stripes)
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.8,
      });
      const winFloor1 = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 0.8, d + 0.1), windowMat);
      winFloor1.position.y = h * 0.35;
      bGroup.add(winFloor1);

      const winFloor2 = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 0.8, d + 0.1), windowMat);
      winFloor2.position.y = h * 0.7;
      bGroup.add(winFloor2);

      // Optional Part 5: Solar PV Panels Array
      if (hasSolar) {
        const solarMat = new THREE.MeshStandardMaterial({
          color: 0x1e3a8a,
          emissive: 0x172554,
          roughness: 0.15,
          metalness: 0.9,
        });
        const solarPanel = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.7, 0.2, d * 0.6),
          solarMat
        );
        solarPanel.position.set(0, h + 0.7, 0);
        solarPanel.rotation.x = -0.15; // angled towards sun
        bGroup.add(solarPanel);
      }

      // Contact shadow disc on floor
      const shadowDisc = new THREE.Mesh(
        new THREE.PlaneGeometry(w + 3, d + 3),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.01;
      bGroup.add(shadowDisc);

      return bGroup;
    };

    // Build Presidency University Campus Buildings
    // Academic Block A (Engineering)
    scene.add(createProceduralBuilding('Block A', -26, 20, 16, 9, 12, 0x334155, 0x10b981, true));
    // Academic Block B (Lecture Halls)
    scene.add(createProceduralBuilding('Block B', -24, -18, 14, 8, 11, 0x475569, 0xf59e0b));
    // Academic Block C (Labs)
    scene.add(createProceduralBuilding('Block C', -10, 36, 13, 7, 10, 0x3b82f6, 0x1e40af));
    // Central Library
    scene.add(createProceduralBuilding('Central Library', 4, 0, 12, 6, 12, 0x0f766e, 0x14b8a6));
    // Hostel Boys
    scene.add(createProceduralBuilding('Hostel Boys', 28, 22, 18, 12, 14, 0x713f12, 0xb45309));
    // Hostel Girls
    scene.add(createProceduralBuilding('Hostel Girls', 28, -20, 18, 12, 14, 0x831843, 0xdb2777));
    // University Canteen Mess
    scene.add(createProceduralBuilding('Canteen', 18, -22, 12, 5, 10, 0x065f46, 0x059669));

    // 8. Campus Foliage: Procedural 3-tier Trees using InstancedMesh
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.6 });

    const treeCount = 36;
    const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.4, 2.5, 6), treeTrunkMat, treeCount);
    const leavesInst = new THREE.InstancedMesh(new THREE.ConeGeometry(1.6, 3.8, 6), treeLeavesMat, treeCount);

    const dummy = new THREE.Object3D();
    const treeCoords = [
      [-14, 10], [-16, 5], [-12, -8], [-15, -28], [10, 12], [8, 24],
      [14, 18], [12, -10], [6, -26], [-38, 0], [42, 0], [0, 38],
      [-5, -36], [-28, 38], [-36, 22], [38, 34], [36, -34], [18, 38],
      [-36, -30], [-8, 22], [2, 18], [-4, -14], [22, 8], [34, 10],
      [-22, 2], [14, -4], [-2, -2], [30, -8], [24, -36], [-18, -36],
      [-34, -12], [36, 18], [-10, 32], [22, 28], [-28, -8], [0, -18],
    ];

    treeCoords.forEach(([tx, tz], i) => {
      // Trunk
      dummy.position.set(tx, 1.25, tz);
      dummy.rotation.y = (i * 0.4) % Math.PI;
      dummy.scale.set(1, 1 + (i % 3) * 0.2, 1);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(i, dummy.matrix);

      // Foliage
      dummy.position.set(tx, 3.8 + (i % 3) * 0.3, tz);
      dummy.updateMatrix();
      leavesInst.setMatrixAt(i, dummy.matrix);
    });

    trunkInst.instanceMatrix.needsUpdate = true;
    leavesInst.instanceMatrix.needsUpdate = true;
    trunkInst.castShadow = !isSoftwareGl;
    leavesInst.castShadow = !isSoftwareGl;
    scene.add(trunkInst);
    scene.add(leavesInst);

    // 9. Procedural 3D Player Rover / Eco Cart (Composite 8 Parts)
    const playerGroup = new THREE.Group();
    playerGroup.position.copy(gameLoopRef.current.playerPos);

    // Rover Chassis
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Electric Emerald
      roughness: 0.3,
      metalness: 0.7,
    });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.4), chassisMat);
    chassis.position.y = 0.5;
    chassis.castShadow = !isSoftwareGl;
    playerGroup.add(chassis);

    // Rover Cabin & Windshield
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.2,
      metalness: 0.8,
    });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.3), cabinMat);
    cabin.position.set(0, 1.0, -0.1);
    playerGroup.add(cabin);

    // Solar Roof Panel
    const roverSolar = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.08, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.9, roughness: 0.2 })
    );
    roverSolar.position.set(0, 1.4, -0.1);
    playerGroup.add(roverSolar);

    // Wheels (4 rubber cylinders)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);
    wheelGeo.rotateZ(Math.PI / 2);

    const wFL = new THREE.Mesh(wheelGeo, wheelMat);
    wFL.position.set(-0.9, 0.35, 0.8);
    playerGroup.add(wFL);

    const wFR = new THREE.Mesh(wheelGeo, wheelMat);
    wFR.position.set(0.9, 0.35, 0.8);
    playerGroup.add(wFR);

    const wBL = new THREE.Mesh(wheelGeo, wheelMat);
    wBL.position.set(-0.9, 0.35, -0.8);
    playerGroup.add(wBL);

    const wBR = new THREE.Mesh(wheelGeo, wheelMat);
    wBR.position.set(0.9, 0.35, -0.8);
    playerGroup.add(wBR);

    // Front Headlights
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 1.0,
    });
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), lightMat);
    hlLeft.position.set(-0.5, 0.6, 1.25);
    playerGroup.add(hlLeft);

    const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), lightMat);
    hlRight.position.set(0.5, 0.6, 1.25);
    playerGroup.add(hlRight);

    scene.add(playerGroup);

    // 10. Interactive Objective Visual Beacons (Poles with pulsing holographic rings)
    const beaconMeshes: { id: string; mesh: THREE.Group; ring: THREE.Mesh }[] = [];

    objectives.forEach(obj => {
      const bGroup = new THREE.Group();
      bGroup.position.set(obj.x, 0, obj.z);

      // Light Pillar
      const beamMat = new THREE.MeshBasicMaterial({
        color: obj.resource === 'water' ? 0x38bdf8 : obj.resource === 'electricity' ? 0xfbbf24 : 0x34d399,
        transparent: true,
        opacity: 0.45,
      });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 8, 8), beamMat);
      beam.position.y = 4;
      bGroup.add(beam);

      // Floating Pulsing Ring
      const ringGeo = new THREE.TorusGeometry(1.8, 0.15, 8, 24);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: obj.resource === 'water' ? 0x0284c7 : obj.resource === 'electricity' ? 0xd97706 : 0x059669,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 1.2;
      bGroup.add(ring);

      scene.add(bGroup);
      beaconMeshes.push({ id: obj.id, mesh: bGroup, ring });
    });

    // 11. Keyboard Event Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') gameLoopRef.current.keys.w = true;
      if (k === 's' || k === 'arrowdown') gameLoopRef.current.keys.s = true;
      if (k === 'a' || k === 'arrowleft') gameLoopRef.current.keys.a = true;
      if (k === 'd' || k === 'arrowright') gameLoopRef.current.keys.d = true;

      // Space: Action / Fix
      if (e.code === 'Space') {
        e.preventDefault();
        triggerInteractAction();
      }

      // Escape: Pause
      if (e.key === 'Escape') {
        setGameState(prev => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') gameLoopRef.current.keys.w = false;
      if (k === 's' || k === 'arrowdown') gameLoopRef.current.keys.s = false;
      if (k === 'a' || k === 'arrowleft') gameLoopRef.current.keys.a = false;
      if (k === 'd' || k === 'arrowright') gameLoopRef.current.keys.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Action Trigger Function
    const triggerInteractAction = () => {
      const loop = gameLoopRef.current;
      if (loop.state !== 'playing' || !loop.nearbyObjective) return;

      const target = loop.nearbyObjective;
      if (target.completed) return;

      audioRef.current.playFixAction();

      // Update objective
      setObjectives(prev =>
        prev.map(o => (o.id === target.id ? { ...o, completed: true } : o))
      );

      // Hide visual beacon
      const matchBeacon = beaconMeshes.find(b => b.id === target.id);
      if (matchBeacon) matchBeacon.mesh.visible = false;

      // Add scores
      setScore(prev => prev + target.points);
      setRupeesSaved(prev => prev + target.savingsRupees);
      onPointsEarned(target.points, `Resolved 3D Wastage: ${target.title} at ${target.locationName}`);

      loop.completedCount++;
      if (loop.completedCount >= loop.objectivesList.length) {
        // Victory!
        audioRef.current.playVictory();
        setGameState('victory');
      }
    };

    // 12. Main 60fps Game Simulation Loop with Delta Clamping
    let prevTime = performance.now();
    let frameId = 0;

    const clock = new THREE.Clock();

    const tick = () => {
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // clamp frame delta time
      const time = clock.getElapsedTime();

      const loop = gameLoopRef.current;

      // Only simulate physics when in 'playing' state
      if (loop.state === 'playing') {
        // Acceleration & Friction
        if (loop.keys.w) {
          loop.speed = Math.min(loop.speed + loop.accel * dt, loop.maxSpeed);
        } else if (loop.keys.s) {
          loop.speed = Math.max(loop.speed - loop.accel * dt, -loop.maxSpeed * 0.5);
        } else {
          // Friction deceleration
          if (loop.speed > 0) loop.speed = Math.max(0, loop.speed - loop.friction * dt);
          else if (loop.speed < 0) loop.speed = Math.min(0, loop.speed + loop.friction * dt);
        }

        // Steering (inverts when reversing)
        const dir = loop.speed >= 0 ? 1 : -1;
        if (loop.keys.a) loop.playerAngle += loop.turnSpeed * dt * dir;
        if (loop.keys.d) loop.playerAngle -= loop.turnSpeed * dt * dir;

        // Apply Velocity
        loop.playerPos.x += Math.sin(loop.playerAngle) * loop.speed * dt;
        loop.playerPos.z += Math.cos(loop.playerAngle) * loop.speed * dt;

        // Clamp boundaries (-65 to 65 campus extent)
        loop.playerPos.x = Math.max(-65, Math.min(65, loop.playerPos.x));
        loop.playerPos.z = Math.max(-65, Math.min(65, loop.playerPos.z));

        // Update 3D player mesh
        playerGroup.position.copy(loop.playerPos);
        playerGroup.rotation.y = loop.playerAngle;

        // Animate wheels rotation
        const wheelRot = (loop.speed * dt) / 0.35;
        wFL.rotation.x += wheelRot;
        wFR.rotation.x += wheelRot;
        wBL.rotation.x += wheelRot;
        wBR.rotation.x += wheelRot;

        // Smooth Damped Follow Camera
        const camOffset = new THREE.Vector3(
          -Math.sin(loop.playerAngle) * 14,
          10,
          -Math.cos(loop.playerAngle) * 14
        );
        const targetCamPos = loop.playerPos.clone().add(camOffset);
        camera.position.lerp(targetCamPos, 0.08);
        camera.lookAt(loop.playerPos.clone().add(new THREE.Vector3(0, 1.5, 0)));

        // Pulse Beacon Rings
        beaconMeshes.forEach(b => {
          b.ring.rotation.z += 1.5 * dt;
          b.ring.position.y = 1.2 + Math.sin(time * 3) * 0.3;
        });

        // Proximity Detection for Objectives
        let foundNearby: Objective | null = null;
        for (const obj of loop.objectivesList) {
          if (obj.completed) continue;
          const dist = loop.playerPos.distanceTo(new THREE.Vector3(obj.x, 0, obj.z));
          if (dist <= obj.radius) {
            foundNearby = obj;
            break;
          }
        }

        loop.nearbyObjective = foundNearby;
        setActivePrompt(foundNearby ? foundNearby.promptText : null);
      } else if (loop.state === 'title') {
        // Dramatic Slow Orbit Camera on Title Screen
        camera.position.x = Math.sin(time * 0.25) * 45;
        camera.position.z = Math.cos(time * 0.25) * 45;
        camera.position.y = 26;
        camera.lookAt(0, 4, 0);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // 13. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      groundTex.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 14. Timer Countdown during playing
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Start / Restart Game
  const handleStartGame = () => {
    audioRef.current.playCollect();
    setScore(0);
    setRupeesSaved(0);
    setTimeLeft(90);
    setObjectives(prev => prev.map(o => ({ ...o, completed: false })));
    gameLoopRef.current.playerPos.set(0, 0, 10);
    gameLoopRef.current.playerAngle = 0;
    gameLoopRef.current.speed = 0;
    gameLoopRef.current.completedCount = 0;
    setGameState('playing');
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.setMuted(next);
  };

  const completedCount = objectives.filter(o => o.completed).length;

  return (
    <div className="relative w-full h-[85vh] rounded-3xl overflow-hidden bg-gray-950 border border-emerald-900 shadow-2xl select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* 1. TITLE SCREEN OVERLAY */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-between p-8 sm:p-12 text-white">
          <div className="w-full flex items-center justify-between">
            <button
              onClick={onExitGame}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Hero Title Lockup with 30-40% Negative Space */}
          <div className="text-center max-w-xl my-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Three.js Interactive 3D Simulator</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              ECO-PATROL <span className="text-emerald-400">3D</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-medium">
              Take the wheel of Presidency University's Electric Campus Patrol Rover! Hunt down active energy burn, isolate nocturnal water leaks, and sync rooftop solar in real-time 3D.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-gray-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-gray-950" />
                <span>START CAMPUS PATROL</span>
              </button>
            </div>
          </div>

          {/* Flat Control Hint Line */}
          <div className="text-center">
            <p className="text-xs font-mono text-emerald-300/80 tracking-wide bg-white/5 px-4 py-2 rounded-full border border-white/10">
              WASD / Arrow Keys Move · Space Action · Esc Pause
            </p>
          </div>
        </div>
      )}

      {/* 2. IN-GAME LOW-OCCLUSION HUD (85% playfield unobstructed) */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between z-20">
          {/* Top Status Cluster */}
          <div className="flex items-start justify-between gap-4">
            {/* Left Score & Savings cluster */}
            <div className="bg-gray-900/85 border border-emerald-500/40 rounded-2xl p-3 sm:p-4 text-white shadow-lg pointer-events-auto flex items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Eco Score
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {score.toLocaleString()} <span className="text-xs font-normal text-emerald-300">pts</span>
                </span>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Rupees Saved
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                  ₹{rupeesSaved.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Right Timer & Objectives cluster */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div
                className={`bg-gray-900/85 border rounded-2xl p-3 sm:p-4 text-white shadow-lg flex items-center gap-2.5 ${
                  timeLeft <= 20 ? 'border-rose-500 text-rose-400 animate-pulse' : 'border-emerald-500/40'
                }`}
              >
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-xl sm:text-2xl font-black font-mono">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleMute}
                className="p-3 bg-gray-900/85 border border-white/10 rounded-2xl text-white hover:bg-gray-800 transition-all cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setGameState('paused')}
                className="p-3 bg-gray-900/85 border border-white/10 rounded-2xl text-white hover:bg-gray-800 transition-all cursor-pointer"
              >
                <Pause className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Interactive Action Prompt (appears when near objective) */}
          {activePrompt && (
            <div className="self-center bg-emerald-950/95 border-2 border-emerald-400 text-white px-6 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3 pointer-events-auto">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-black text-xs sm:text-sm tracking-wider uppercase font-mono">
                {activePrompt}
              </span>
            </div>
          )}

          {/* Bottom Objectives Bar */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pointer-events-auto">
            {/* Objective checklist */}
            <div className="bg-gray-900/90 border border-white/10 rounded-2xl p-3 sm:p-4 text-white text-xs max-w-md w-full shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-300">
                  Campus Wastage Hotspots ({completedCount} / {objectives.length})
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {Math.round((completedCount / objectives.length) * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {objectives.map(obj => (
                  <div
                    key={obj.id}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${
                      obj.completed
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-white/5 border-white/5 text-gray-400'
                    }`}
                  >
                    <CheckCircle
                      className={`w-3.5 h-3.5 ${
                        obj.completed ? 'text-emerald-400' : 'text-gray-600'
                      }`}
                    />
                    <span className="truncate">{obj.locationName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Touch Action Button for Mobile Users */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => {
                  // simulate Space
                  const loop = gameLoopRef.current;
                  if (loop.nearbyObjective && !loop.nearbyObjective.completed) {
                    audioRef.current.playFixAction();
                    const target = loop.nearbyObjective;
                    setObjectives(prev =>
                      prev.map(o => (o.id === target.id ? { ...o, completed: true } : o))
                    );
                    setScore(prev => prev + target.points);
                    setRupeesSaved(prev => prev + target.savingsRupees);
                    onPointsEarned(target.points, `Resolved: ${target.title}`);
                    loop.completedCount++;
                    if (loop.completedCount >= loop.objectivesList.length) {
                      audioRef.current.playVictory();
                      setGameState('victory');
                    }
                  }
                }}
                className="px-6 py-3.5 bg-emerald-500 active:scale-95 text-gray-950 font-black text-sm rounded-2xl shadow-xl font-mono cursor-pointer"
              >
                INTERACT / FIX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PAUSE MODAL */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-xs flex items-center justify-center p-6 text-white">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-2xl font-black text-white">Mission Paused</h3>
            <p className="text-xs text-gray-400">
              Presidency University patrol simulation suspended.
            </p>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setGameState('playing')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Resume Patrol
              </button>

              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Restart Mission
              </button>

              <button
                type="button"
                onClick={onExitGame}
                className="w-full py-2.5 text-gray-500 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VICTORY MODAL */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 text-white animate-in fade-in">
          <div className="bg-gradient-to-b from-gray-900 to-emerald-950 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                Presidency Campus Clean Sweep!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                CAMPUS SAVED!
              </h2>
              <p className="text-xs text-emerald-200 mt-1">
                You successfully inspected and resolved all active wastage hotspots across Itgalpura campus before the timer expired!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Total Score
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  +{score} Pts
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Rupees Prevented
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  ₹{rupeesSaved}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                type="button"
                onClick={onExitGame}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. GAME OVER MODAL */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 text-white animate-in fade-in">
          <div className="bg-gray-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-black text-white">Time Expired!</h3>
            <p className="text-xs text-gray-400">
              Campus nighttime lockouts engaged before all leaks were sealed.
              You saved ₹{rupeesSaved} and resolved {completedCount} of {objectives.length} hotspots.
            </p>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={onExitGame}
                className="w-full py-2.5 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
