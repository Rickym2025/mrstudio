import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function DottedSurface() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Pulizia per evitare duplicati
        containerRef.current.innerHTML = '';

        const SEPARATION = 100;
        const AMOUNTX = 80; // Aumentiamo la distesa
        const AMOUNTY = 80;

        // 1. Setup Scena
        const scene = new THREE.Scene();
        const bgColor = 0x020205;
        scene.fog = new THREE.Fog(bgColor, 1000, 3500);

        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );

        // --- QUESTA È LA PARTE CHE TRASFORMA LA "PARETE" IN UN "MARE" ---
        // X=0 (centro), Y=1200 (molto in alto), Z=1800 (lontano)
        camera.position.set(0, 1200, 1800);
        camera.lookAt(0, 0, 0); // Punta al centro del mare di pallini

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(bgColor, 1);
        containerRef.current.appendChild(renderer.domElement);

        // 2. Particelle
        const numParticles = AMOUNTX * AMOUNTY;
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                // Griglia piatta sul pavimento (X, Z)
                positions[i * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                positions[i * 3 + 1] = 0; // Altezza Y (iniziale)
                positions[i * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                // Colori Cyber
                if (Math.random() > 0.5) {
                    colors[i * 3] = 0.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0; // Ciano
                } else {
                    colors[i * 3] = 0.44; colors[i * 3 + 1] = 0.0; colors[i * 3 + 2] = 1.0; // Viola
                }
                i++;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let count = 0;
        let animationId: number;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            const posAttr = geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;

            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    // EFFETTO ONDA: Sommiamo due seni per movimento organico
                    posArray[i * 3 + 1] =
                        Math.sin((ix + count) * 0.3) * 60 +
                        Math.sin((iy + count) * 0.5) * 60;
                    i++;
                }
            }

            posAttr.needsUpdate = true;
            
            // Rotazione panoramica lentissima
            points.rotation.y = count * 0.02;

            renderer.render(scene, camera);
            count += 0.04; // Velocità movimento
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            // Z-INDEX -1 per stare dietro al testo
            className="fixed inset-0 z-[-1] bg-[#020205] overflow-hidden pointer-events-none"
        />
    );
}
