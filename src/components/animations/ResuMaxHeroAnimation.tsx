import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export interface ResuMaxHeroAnimationProps {
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
}

export const ResuMaxHeroAnimation: React.FC<ResuMaxHeroAnimationProps> = ({
  className = '',
  showControls = false,
  autoPlay = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [currentPhase, setCurrentPhase] = useState('0.0s — Neural Activation');

  const CYCLE_DURATION = 10.0;
  const V_WIDTH = 1920;
  const V_HEIGHT = 1080;
  const FOCAL_LENGTH = 880;
  const DOC_W = 380;
  const DOC_H = 540;

  // Mouse coords for subtle parallax
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const timeRef = useRef(0.0);
  const lastTimeRef = useRef(performance.now());
  const isPlayingRef = useRef(autoPlay);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(playbackSpeed);
  speedRef.current = playbackSpeed;

  // Project 3D coordinate to 2D screen coordinate
  const project3D = useCallback((x: number, y: number, z: number, camZ: number, rotY: number, rotX: number) => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const effectiveZ = z2 + camZ;
    const scale = FOCAL_LENGTH / Math.max(FOCAL_LENGTH + effectiveZ, 40);

    return {
      px: V_WIDTH / 2 + x1 * scale,
      py: V_HEIGHT / 2 + y2 * scale,
      scale,
      depth: effectiveZ,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Background drifting particles
    const PARTICLE_COUNT = 150;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2400,
      y: (Math.random() - 0.5) * 1600,
      z: Math.random() * 1400 - 400,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      radius: Math.random() * 2.2 + 0.8,
      color: Math.random() > 0.4 ? 'cyan' : (Math.random() > 0.5 ? 'violet' : 'blue'),
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 1.5 + 1.0,
    }));

    // Neural nodes
    const NEURAL_NODE_COUNT = 36;
    const neuralNodes = Array.from({ length: NEURAL_NODE_COUNT }, (_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 160 + Math.random() * 180;
      return {
        id: i,
        nx: radius * Math.sin(phi) * Math.cos(theta),
        ny: radius * Math.sin(phi) * Math.sin(theta) * 0.75,
        nz: radius * Math.cos(phi) * 0.5,
        dx: ((i % 6) - 2.5) * 65,
        dy: (Math.floor(i / 6) - 2.5) * 85,
        dz: 0,
        pulse: Math.random() * Math.PI * 2,
        importance: Math.random() > 0.6 ? 2 : 1,
      };
    });

    const synapticLinks: { i: number; j: number }[] = [];
    for (let i = 0; i < NEURAL_NODE_COUNT; i++) {
      for (let j = i + 1; j < NEURAL_NODE_COUNT; j++) {
        const dist = Math.hypot(
          neuralNodes[i].nx - neuralNodes[j].nx,
          neuralNodes[i].ny - neuralNodes[j].ny,
          neuralNodes[i].nz - neuralNodes[j].nz
        );
        if (dist < 190) synapticLinks.push({ i, j });
      }
    }

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = V_WIDTH * dpr;
      canvas.height = V_HEIGHT * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation Tick Loop
    const render = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Mouse smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (isPlayingRef.current) {
        timeRef.current = (timeRef.current + delta * speedRef.current) % CYCLE_DURATION;
      }
      const t = timeRef.current;

      // Camera model
      const camZ = 120 - Math.sin((t / CYCLE_DURATION) * Math.PI * 0.9) * 110;
      const rotY = Math.sin(t * 0.45) * 0.09 + mouseRef.current.x * 0.12;
      const rotX = Math.cos(t * 0.35) * 0.05 + mouseRef.current.y * 0.08;

      // Timeline phases
      let neuralAlpha = t < 2.0 ? Math.min(t / 0.8, 1.0) : t < 3.8 ? 1.0 - (t - 2.0) / 1.8 : t > 8.8 ? (t - 8.8) / 1.2 : 0;
      let condensation = 0;
      if (t >= 2.0 && t <= 3.8) {
        const c = (t - 2.0) / 1.8;
        condensation = c * c * (3 - 2 * c);
      } else if (t > 3.8 && t < 8.8) {
        condensation = 1.0;
      } else if (t >= 8.8) {
        const c = 1.0 - (t - 8.8) / 1.2;
        condensation = c * c * (3 - 2 * c);
      }

      const docAlpha = t >= 2.4 && t <= 8.8 ? Math.min((t - 2.4) / 0.8, 1.0) : t > 8.8 ? Math.max(1.0 - (t - 8.8) / 0.9, 0.0) : 0;
      const scanActive = t >= 3.8 && t <= 6.6;
      const scanProgress = scanActive ? (t - 3.8) / 2.8 : 0;

      // Card Alphas
      const card1Alpha = t >= 4.2 && t <= 8.0 ? Math.min((t - 4.2) / 0.5, 1.0) : t > 8.0 && t <= 8.7 ? 1.0 - (t - 8.0) / 0.7 : 0;
      const card2Alpha = t >= 4.8 && t <= 8.2 ? Math.min((t - 4.8) / 0.5, 1.0) : t > 8.2 && t <= 8.8 ? 1.0 - (t - 8.2) / 0.6 : 0;
      const card3Alpha = t >= 5.4 && t <= 8.4 ? Math.min((t - 5.4) / 0.5, 1.0) : t > 8.4 && t <= 8.9 ? 1.0 - (t - 8.4) / 0.5 : 0;

      const card1Offset = t > 8.0 ? -((t - 8.0) / 0.7) * 120 : Math.max(0, 40 * (1 - (t - 4.2) / 0.5));
      const card2Offset = t > 8.2 ? -((t - 8.2) / 0.6) * 120 : Math.max(0, 40 * (1 - (t - 4.8) / 0.5));
      const card3Offset = t > 8.4 ? -((t - 8.4) / 0.5) * 120 : Math.max(0, 40 * (1 - (t - 5.4) / 0.5));

      const atsGaugeAlpha = t >= 6.4 && t <= 8.8 ? Math.min((t - 6.4) / 0.6, 1.0) : t > 8.8 ? Math.max(1.0 - (t - 8.8) / 0.8, 0.0) : 0;
      const atsFraction = Math.min(Math.max((t - 6.4) / 1.8, 0), 1);
      const atsScore = 64 + Math.floor(atsFraction * 34);
      const atsRestructured = atsFraction * atsFraction * (3 - 2 * atsFraction);

      // CLEAR & BACKGROUND
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      const bgGlow = ctx.createRadialGradient(V_WIDTH / 2, V_HEIGHT / 2, 40, V_WIDTH / 2, V_HEIGHT / 2, 850);
      bgGlow.addColorStop(0, 'rgba(11, 25, 59, 0.45)');
      bgGlow.addColorStop(0.4, 'rgba(6, 14, 38, 0.25)');
      bgGlow.addColorStop(1, 'rgba(2, 4, 10, 0.0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // PARTICLES
      particles.forEach((p) => {
        const curX = (p.x + p.vx * t) % 1800;
        const curY = (p.y + p.vy * t) % 1200;
        const curZ = p.z + Math.sin(t * p.pulseSpeed + p.pulseOffset) * 40;
        const proj = project3D(curX, curY, curZ, camZ, rotY * 0.4, rotX * 0.4);
        if (proj.px >= -50 && proj.px <= V_WIDTH + 50 && proj.py >= -50 && proj.py <= V_HEIGHT + 50) {
          const alpha = (0.25 + 0.45 * Math.sin(t * 2 + p.pulseOffset)) * Math.min(proj.scale * 1.4, 1.0);
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, p.radius * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color === 'cyan' ? `rgba(0, 210, 255, ${alpha})` : p.color === 'violet' ? `rgba(168, 85, 247, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
          ctx.fill();
        }
      });

      // NEURAL NETWORK
      if (neuralAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = neuralAlpha;

        const interpNodes = neuralNodes.map((n) => {
          const nx = n.nx * (1 - condensation) + n.dx * condensation;
          const ny = n.ny * (1 - condensation) + n.dy * condensation;
          const nz = n.nz * (1 - condensation) + n.dz * condensation;
          return { ...n, ...project3D(nx, ny, nz, camZ, rotY, rotX) };
        });

        synapticLinks.forEach((link, k) => {
          const p1 = interpNodes[link.i];
          const p2 = interpNodes[link.j];
          const pulseT = (t * 1.5 + k * 0.2) % 1.0;

          const grad = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
          grad.addColorStop(pulseT, 'rgba(168, 85, 247, 0.6)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.0 * Math.min(p1.scale, p2.scale);
          ctx.stroke();

          const pktX = p1.px + (p2.px - p1.px) * pulseT;
          const pktY = p1.py + (p2.py - p1.py) * pulseT;
          ctx.beginPath();
          ctx.arc(pktX, pktY, 1.8 * p1.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 210, 255, 0.85)';
          ctx.fill();
        });

        interpNodes.forEach((node) => {
          const nodePulse = Math.sin(t * 3 + node.pulse) * 0.3 + 0.7;
          const glowRadius = (node.importance === 2 ? 14 : 9) * node.scale * nodePulse;
          const nodeGlow = ctx.createRadialGradient(node.px, node.py, 1, node.px, node.py, glowRadius);
          nodeGlow.addColorStop(0, 'rgba(0, 210, 255, 0.9)');
          nodeGlow.addColorStop(0.4, 'rgba(139, 92, 246, 0.4)');
          nodeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = nodeGlow;
          ctx.beginPath();
          ctx.arc(node.px, node.py, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.px, node.py, (node.importance === 2 ? 3.5 : 2.2) * node.scale, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        ctx.restore();
      }

      // RESUME GLASS DOCUMENT
      if (docAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = docAlpha;

        const halfW = DOC_W / 2;
        const halfH = DOC_H / 2;

        const pTL = project3D(-halfW, -halfH, 0, camZ, rotY, rotX);
        const pTR = project3D(halfW, -halfH, 0, camZ, rotY, rotX);
        const pBR = project3D(halfW, halfH, 0, camZ, rotY, rotX);
        const pBL = project3D(-halfW, halfH, 0, camZ, rotY, rotX);
        const centerDoc = project3D(0, 0, 0, camZ, rotY, rotX);

        // Document Glass Plate
        ctx.beginPath();
        ctx.moveTo(pTL.px, pTL.py);
        ctx.lineTo(pTR.px, pTR.py);
        ctx.lineTo(pBR.px, pBR.py);
        ctx.lineTo(pBL.px, pBL.py);
        ctx.closePath();

        const glassGrad = ctx.createLinearGradient(pTL.px, pTL.py, pBR.px, pBR.py);
        glassGrad.addColorStop(0, 'rgba(16, 27, 54, 0.72)');
        glassGrad.addColorStop(0.35, 'rgba(8, 16, 36, 0.82)');
        glassGrad.addColorStop(0.65, 'rgba(14, 25, 48, 0.78)');
        glassGrad.addColorStop(1, 'rgba(6, 12, 28, 0.88)');
        ctx.fillStyle = glassGrad;
        ctx.fill();

        const borderGrad = ctx.createLinearGradient(pTL.px, pTL.py, pBR.px, pBR.py);
        borderGrad.addColorStop(0, 'rgba(0, 210, 255, 0.7)');
        borderGrad.addColorStop(0.4, 'rgba(139, 92, 246, 0.4)');
        borderGrad.addColorStop(1, 'rgba(0, 210, 255, 0.6)');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 1.8 * centerDoc.scale;
        ctx.stroke();

        const margin = 28;

        const drawBar = (localX: number, localY: number, width: number, height: number, color: string, glow: boolean) => {
          const b1 = project3D(-halfW + localX, -halfH + localY, 0, camZ, rotY, rotX);
          const b2 = project3D(-halfW + localX + width, -halfH + localY, 0, camZ, rotY, rotX);
          const b3 = project3D(-halfW + localX + width, -halfH + localY + height, 0, camZ, rotY, rotX);
          const b4 = project3D(-halfW + localX, -halfH + localY + height, 0, camZ, rotY, rotX);

          ctx.beginPath();
          ctx.moveTo(b1.px, b1.py);
          ctx.lineTo(b2.px, b2.py);
          ctx.lineTo(b3.px, b3.py);
          ctx.lineTo(b4.px, b4.py);
          ctx.closePath();

          if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
          }
          ctx.fillStyle = color;
          ctx.fill();
          if (glow) ctx.shadowBlur = 0;
        };

        // Resume sections
        drawBar(margin, 30, 160, 14, '#ffffff', false); // Name
        drawBar(margin, 52, 110, 7, 'rgba(56, 189, 248, 0.85)', false); // Title
        drawBar(margin, 66, 36, 5, 'rgba(148, 163, 184, 0.5)', false);
        drawBar(margin + 44, 66, 36, 5, 'rgba(148, 163, 184, 0.5)', false);
        drawBar(margin, 80, DOC_W - margin * 2, 1.5, 'rgba(255, 255, 255, 0.12)', false);

        // Summary
        drawBar(margin, 96, 75, 8, 'rgba(168, 85, 247, 0.9)', true);
        drawBar(margin, 112, DOC_W - margin * 2 - 20, 6, 'rgba(226, 232, 240, 0.65)', false);
        drawBar(margin, 124, DOC_W - margin * 2 - 40, 6, 'rgba(226, 232, 240, 0.65)', false);

        // Experience & Measurable Bullets
        drawBar(margin, 158, 110, 8, 'rgba(56, 189, 248, 0.9)', true);
        drawBar(margin, 174, 140, 7, 'rgba(255, 255, 255, 0.85)', false);

        const b1Glow = scanProgress > 0.35 || atsRestructured > 0.2;
        const b2Glow = scanProgress > 0.55 || atsRestructured > 0.2;
        const b3Glow = scanProgress > 0.70 || atsRestructured > 0.2;

        drawBar(margin, 190, 6, 6, b1Glow ? '#00d2ff' : 'rgba(148, 163, 184, 0.4)', b1Glow);
        drawBar(margin + 14, 190, DOC_W - margin * 2 - 14, 6, b1Glow ? 'rgba(0, 210, 255, 0.95)' : 'rgba(203, 213, 225, 0.55)', b1Glow);

        drawBar(margin, 218, 6, 6, b2Glow ? '#a855f7' : 'rgba(148, 163, 184, 0.4)', b2Glow);
        drawBar(margin + 14, 218, DOC_W - margin * 2 - 30, 6, b2Glow ? 'rgba(168, 85, 247, 0.95)' : 'rgba(203, 213, 225, 0.55)', b2Glow);

        drawBar(margin, 246, 6, 6, b3Glow ? '#f59e0b' : 'rgba(148, 163, 184, 0.4)', b3Glow);
        drawBar(margin + 14, 246, DOC_W - margin * 2 - 45, 6, b3Glow ? 'rgba(245, 158, 11, 0.9)' : 'rgba(203, 213, 225, 0.55)', b3Glow);

        // Projects & Education
        drawBar(margin, 274, 90, 8, 'rgba(56, 189, 248, 0.9)', true);
        drawBar(margin, 290, 125, 7, 'rgba(255, 255, 255, 0.8)', false);
        drawBar(margin, 342, 85, 8, 'rgba(168, 85, 247, 0.8)', false);
        drawBar(DOC_W - margin - 45, 358, 45, 6.5, 'rgba(16, 185, 129, 0.8)', true);

        // Scanning Laser Beam
        if (scanActive) {
          const beamY = -halfH + margin + scanProgress * (DOC_H - margin * 2);
          const pL = project3D(-halfW + 10, beamY, 15, camZ, rotY, rotX);
          const pR = project3D(halfW - 10, beamY, 15, camZ, rotY, rotX);

          ctx.beginPath();
          ctx.moveTo(pL.px, pL.py);
          ctx.lineTo(pR.px, pR.py);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5 * centerDoc.scale;
          ctx.shadowColor = '#00d2ff';
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      // HOLOGRAPHIC SUGGESTION CARDS
      const drawCard = (cx: number, cy: number, cz: number, w: number, h: number, alpha: number, renderContent: (pos: { px: number; py: number; scale: number }) => void) => {
        if (alpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = alpha;

        const p1 = project3D(cx, cy, cz, camZ, rotY, rotX);
        const p2 = project3D(cx + w, cy, cz, camZ, rotY, rotX);
        const p3 = project3D(cx + w, cy + h, cz, camZ, rotY, rotX);
        const p4 = project3D(cx, cy + h, cz, camZ, rotY, rotX);

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.lineTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.closePath();

        const cardBg = ctx.createLinearGradient(p1.px, p1.py, p3.px, p3.py);
        cardBg.addColorStop(0, 'rgba(8, 16, 36, 0.92)');
        cardBg.addColorStop(1, 'rgba(4, 8, 20, 0.96)');
        ctx.fillStyle = cardBg;
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.2 * p1.scale;
        ctx.stroke();

        renderContent(p1);
        ctx.restore();
      };

      // Card 1: Latency Metric
      drawCard(DOC_W / 2 + 35 + card1Offset, -180, 35, 265, 95, card1Alpha, (pos) => {
        ctx.fillStyle = 'rgba(0, 210, 255, 0.15)';
        ctx.fillRect(pos.px + 10 * pos.scale, pos.py + 10 * pos.scale, 170 * pos.scale, 16 * pos.scale);
        ctx.fillStyle = '#00d2ff';
        ctx.font = `bold ${Math.round(9 * pos.scale)}px monospace`;
        ctx.fillText('⚡ AI ACHIEVEMENT ENHANCEMENT', pos.px + 15 * pos.scale, pos.py + 21 * pos.scale);

        ctx.fillStyle = '#10b981';
        ctx.font = `bold ${Math.round(18 * pos.scale)}px sans-serif`;
        ctx.fillText('+42% LATENCY BOOST', pos.px + 12 * pos.scale, pos.py + 46 * pos.scale);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `${Math.round(9 * pos.scale)}px sans-serif`;
        ctx.fillText('Reduced p99 query latency (850ms → 490ms)', pos.px + 12 * pos.scale, pos.py + 62 * pos.scale);
        ctx.fillText('via index partitioning.', pos.px + 12 * pos.scale, pos.py + 74 * pos.scale);
      });

      // Card 2: Guardrail (Evidence Prompting)
      drawCard(DOC_W / 2 + 35 + card2Offset, -65, 45, 275, 105, card2Alpha, (pos) => {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.fillRect(pos.px + 10 * pos.scale, pos.py + 10 * pos.scale, 195 * pos.scale, 16 * pos.scale);
        ctx.fillStyle = '#f59e0b';
        ctx.font = `bold ${Math.round(9 * pos.scale)}px monospace`;
        ctx.fillText('🛡️ EVIDENCE VALIDATION GUARDRAIL', pos.px + 15 * pos.scale, pos.py + 21 * pos.scale);

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.round(12 * pos.scale)}px sans-serif`;
        ctx.fillText('CANDIDATE EVIDENCE REQUIRED', pos.px + 12 * pos.scale, pos.py + 44 * pos.scale);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = `${Math.round(9 * pos.scale)}px sans-serif`;
        ctx.fillText('AI detected unquantified operational claim.', pos.px + 12 * pos.scale, pos.py + 58 * pos.scale);
        ctx.fillText('Prompting candidate for verified evidence.', pos.px + 12 * pos.scale, pos.py + 70 * pos.scale);
      });

      // Card 3: Time Saved
      drawCard(DOC_W / 2 + 35 + card3Offset, 60, 25, 265, 95, card3Alpha, (pos) => {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
        ctx.fillRect(pos.px + 10 * pos.scale, pos.py + 10 * pos.scale, 175 * pos.scale, 16 * pos.scale);
        ctx.fillStyle = '#c084fc';
        ctx.font = `bold ${Math.round(9 * pos.scale)}px monospace`;
        ctx.fillText('⏱️ MEASURABLE TIME RECOVERY', pos.px + 15 * pos.scale, pos.py + 21 * pos.scale);

        ctx.fillStyle = '#a855f7';
        ctx.font = `bold ${Math.round(17 * pos.scale)}px sans-serif`;
        ctx.fillText('16 HRS / WEEK SAVED', pos.px + 12 * pos.scale, pos.py + 45 * pos.scale);
      });

      // ATS Gauge (98%)
      if (atsGaugeAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = atsGaugeAlpha;

        const gPos = project3D(-DOC_W / 2 - 130, -110, 40, camZ, rotY, rotX);
        const radius = 48 * gPos.scale;

        ctx.beginPath();
        ctx.arc(gPos.px, gPos.py, radius * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 16, 36, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(gPos.px, gPos.py, radius, -Math.PI * 0.75, -Math.PI * 0.75 + Math.PI * 1.5 * (atsScore / 100));
        ctx.strokeStyle = '#00d2ff';
        ctx.lineWidth = 5 * gPos.scale;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(24 * gPos.scale)}px sans-serif`;
        ctx.fillText(`${atsScore}`, gPos.px, gPos.py + 4 * gPos.scale);

        ctx.fillStyle = '#38bdf8';
        ctx.font = `bold ${Math.round(8 * gPos.scale)}px monospace`;
        ctx.fillText('ATS SCORE', gPos.px, gPos.py + 18 * gPos.scale);
        ctx.textAlign = 'left';

        ctx.restore();
      }

      // Sync state for controls UI if needed
      if (showControls) {
        setCurrentTime(t);
        if (t < 2.2) setCurrentPhase('0.0s — Neural Awakening');
        else if (t < 4.2) setCurrentPhase('2.2s — Glass Resume Condensation');
        else if (t < 6.8) setCurrentPhase('4.2s — AI Achievement Suggestions');
        else if (t < 8.8) setCurrentPhase('6.8s — ATS 98% Restructuring');
        else setCurrentPhase('8.8s — Seamless Loop Dissolve');
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [project3D, showControls]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* 16:9 Viewport Container */}
      <div
        ref={containerRef}
        className="w-full aspect-video max-w-7xl mx-auto rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800/80 bg-[#02040a]"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Optional Interactive Controller */}
      {showControls && (
        <div className="mt-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { timeRef.current = 0; }}
              className="p-1.5 rounded-lg border border-slate-700 hover:border-slate-500"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
              {[0.5, 1.0, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded ${playbackSpeed === speed ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <span className="font-mono text-cyan-400">{currentPhase}</span>
          </div>
          <div className="font-mono text-slate-400">
            {currentTime.toFixed(2)}s / 10.00s
          </div>
        </div>
      )}
    </div>
  );
};
