"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function GradientScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(3, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      emissive: 0x1d2433,
      metalness: 0.4,
      roughness: 0.6,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const light = new THREE.PointLight(0x60a5fa, 1.4);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x1f2933, 1.2);
    scene.add(ambient);

    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener("resize", handleResize);

    let frameId: number;

    const animate = () => {
      mesh.rotation.y += 0.0025;
      mesh.rotation.x += 0.0015;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 opacity-[0.18]" />;
}
