'use client'

import { useEffect, useRef } from 'react'
import { calculateAngle} from './utils'

export default function CameraView() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const repCountRef = useRef(0);
    const stageRef = useRef<'up' | 'down'>('up');

    useEffect(() => {
        //console.log("useEffect running");
        const { Pose, POSE_CONNECTIONS } = require('@mediapipe/pose');
        const { drawConnectors, drawLandmarks } = require('@mediapipe/drawing_utils');

        const startCamera = async () => {
            try {
                //console.log("useEffect running");
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    //console.log('Camera stream started');
                    videoRef.current.addEventListener('loadeddata', () => {
                        //console.log("Video loaded, starting AI loop");
                        const sendToAI = async () => {
                            if (videoRef.current && videoRef.current.readyState >= 2) {
                                await pose.send({ image: videoRef.current });
                            }
                            requestAnimationFrame(sendToAI);
                        };
                        sendToAI();
                    });
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
            //console.log("AI running, landmarks found:", results.poseLandmarks?.length);
            const canvasCtx = canvasRef.current?.getContext('2d');
            if (!canvasCtx || !canvasRef.current) return;

            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (results.poseLandmarks) {
                drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

                const landmarks = results.poseLandmarks;
                const hip = { x: landmarks[23].x, y: landmarks[23].y };
                const knee = { x: landmarks[25].x, y: landmarks[25].y };
                const ankle = { x: landmarks[27].x, y: landmarks[27].y };

                const kneeAngle = calculateAngle(hip, knee, ankle);
                if (kneeAngle < 90) {
                    stageRef.current = 'down';
                }

                if (kneeAngle > 160 && stageRef.current === 'down') {
                    stageRef.current = 'up';
                    repCountRef.current += 1;
                    console.log("Rep counted! Total:", repCountRef.current);
                }
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