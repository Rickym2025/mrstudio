import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function DottedSurface({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Pulizia preliminare per evitare doppie istanze in Vite
        containerRef.current.innerHTML = '';

        const SEPARATION = 100;
        const AMOUNTX = 60;
        const AMOUNTY = 60;

        // 1. Setup Scena
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x020205, 1000, 2500);

        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1,
            10000,
        );
        camera.position.set(0, 400, 1200);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x020205, 1);

        containerRef.current.appendChild(renderer.domElement);

        // 2. Creazione Particelle
        const positions: number[] = [];
        const colors: number[] = [];

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                const y = 0;
                const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                positions.push(x, y, z);

                if (Math.random() > 0.5) {
                    colors.push(0.0, 0.95, 1.0); // Ciano
                } else {
                    colors.push(0.44, 0.0, 1.0); // Viola
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        
        // LA RIGA CHIAVE: setUsage(THREE.DynamicDrawUsage) per permettere il movimento
        const positionAttribute = new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let count = 0;
        let animationId: number;

        // 3. Funzione di Animazione (La tua logica originale)
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            const attr = geometry.attributes.position;
            const posArray = attr.array as Float32Array;

            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    const index = i * 3;

                    // Calcolo altezza onda
                    posArray[index + 1] =
                        Math.sin((ix + count) * 0.3) * 50 +
                        Math.sin((iy + count) * 0.5) * 50;

                    i++;
                }
            }

            // Forza l'aggiornamento dei punti
            attr.needsUpdate = true;

            // Rotazione leggera
            points.rotation.y = Math.sin(count * 0.05) * 0.1;

            renderer.render(scene, camera);
            
            // INCREMENTO DEL COUNT (Fondamentale per il movimento)
            count += 0.05;
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
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#020205] ${className || ''}`}
        />
    );
}