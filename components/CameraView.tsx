'use client'

import { useEffect, useRef } from 'react'

export default function CameraView() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const { Pose, POSE_CONNECTIONS } = require('@mediapipe/pose');
        const { drawConnectors, drawLandmarks } = require('@mediapipe/drawing_utils');

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadeddata = () => {
                        const sendToAI = async () => {
                            if (videoRef.current && videoRef.current.readyState >= 2) {
                                await pose.send({ image: videoRef.current });
                            }
                            requestAnimationFrame(sendToAI);
                        };
                        sendToAI();
                    };
                }
            } catch (err) {
                console.log("Cant get permission");
            }
        }

        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
            const canvasCtx = canvasRef.current?.getContext('2d');
            if (!canvasCtx || !canvasRef.current) return;

            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (results.poseLandmarks) {
                drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
            }
        });

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [])

    return (
        <div style={{
            position: 'relative',
            width: '640px',
            height: '480px'
        }}>
            <video ref={videoRef} autoPlay playsInline style={{
                position: 'absolute',
                width: '640px',
                height: '480px'
            }}></video>
            <canvas ref={canvasRef}
                style={{ position: 'absolute', }}
                width={640}
                height={480}
            ></canvas>
        </div>
    )
}