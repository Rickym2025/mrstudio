import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function DottedSurface() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = '';

        const SEPARATION = 100;
        const AMOUNTX = 100;
        const AMOUNTY = 100;

        const scene = new THREE.Scene();
        const bgColor = 0x020205;
        // Nebbia ravvicinata per sfumare l'orizzonte
        scene.fog = new THREE.Fog(bgColor, 300, 2500);

        const camera = new THREE.PerspectiveCamera(
            75, // Grandangolo più ampio
            window.innerWidth / window.innerHeight,
            1,
            10000
        );

        // TELECAMERA BASSA AD ALTEZZA OCCHI
        camera.position.set(0, 150, 1000);
        // GUARDIAMO LONTANISSIMO VERSO L'ORIZZONTE
        camera.lookAt(0, 0, -2000); 

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(bgColor, 1);
        containerRef.current.appendChild(renderer.domElement);

        const numParticles = AMOUNTX * AMOUNTY;
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                positions[i * 3 + 1] = 0; 
                positions[i * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                // Colori
                if (Math.random() > 0.5) {
                    colors[i * 3] = 0.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0; 
                } else {
                    colors[i * 3] = 0.44; colors[i * 3 + 1] = 0.0; colors[i * 3 + 2] = 1.0; 
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
        
        // LA MAGIA: Spingiamo tutto l'oceano fisicamente verso il basso (-300px)
        // Così liberiamo la parte alta dello schermo per il testo!
        points.position.y = -300;
        
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
                    // Onde più alte (da 50 a 80) per far sembrare un vero mare
                    posArray[i * 3 + 1] =
                        Math.sin((ix + count) * 0.3) * 80 +
                        Math.sin((iy + count) * 0.5) * 80;
                    i++;
                }
            }

            posAttr.needsUpdate = true;
            renderer.render(scene, camera);
            
            // Velocità dell'acqua
            count += 0.04; 
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
            className="fixed inset-0 z-[-1] bg-[#020205] overflow-hidden pointer-events-none"
        />
    );
}
