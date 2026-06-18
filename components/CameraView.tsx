'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { calculateAngle, playBeep } from './utils'
import styles from './CameraView.module.css'

let poseInstance: any = null;
let poseConnections: any = null;
let drawFns: { drawConnectors: any; drawLandmarks: any } | null = null;

export default function CameraView({ exerciseName = 'Squats' }: { exerciseName?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const repCountRef = useRef(0);
    const stageRef = useRef<'up' | 'down'>('up');
    const angleRef = useRef(0);
    const poseRef = useRef<any>(null);
    const animFrameRef = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const initializedRef = useRef(false);
    const feedbackMsgRef = useRef<string>('');
    const feedbackColorRef = useRef<string>('#c8f542');

    const [isActive, setIsActive] = useState(false);
    const [reps, setReps] = useState(0);
    const [angle, setAngle] = useState(0);
    const [stage, setStage] = useState<'up' | 'down'>('up');
    const [elapsed, setElapsed] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [feedback, setFeedback] = useState({ message: '', color: '#c8f542' });

    const syncUI = useCallback(() => {
        setReps(repCountRef.current);
        setAngle(Math.round(angleRef.current));
        setStage(stageRef.current);
        setFeedback({ message: feedbackMsgRef.current, color: feedbackColorRef.current });
    }, []);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const { Pose, POSE_CONNECTIONS: connections } = require('@mediapipe/pose');
        const { drawConnectors, drawLandmarks } = require('@mediapipe/drawing_utils');
        poseConnections = connections;
        drawFns = { drawConnectors, drawLandmarks };

        if (!poseInstance) {
            poseInstance = new Pose({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            poseInstance.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
        }
        poseRef.current = poseInstance;

        poseInstance.onResults((results: any) => {
            const canvasCtx = canvasRef.current?.getContext('2d');
            if (!canvasCtx || !canvasRef.current || !drawFns) return;

            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (results.poseLandmarks) {
                drawFns.drawConnectors(canvasCtx, results.poseLandmarks, poseConnections, {
                    color: feedbackColorRef.current,
                    lineWidth: 3
                });
                drawFns.drawLandmarks(canvasCtx, results.poseLandmarks, {
                    color: '#ffffff',
                    lineWidth: 1,
                    radius: 4
                });

                const landmarks = results.poseLandmarks;
                const hip = { x: landmarks[23].x, y: landmarks[23].y };
                const knee = { x: landmarks[25].x, y: landmarks[25].y };
                const ankle = { x: landmarks[27].x, y: landmarks[27].y };

                const kneeAngle = calculateAngle(hip, knee, ankle);
                angleRef.current = kneeAngle;

                if (stageRef.current === 'up') {
                    if (kneeAngle > 160) {
                        feedbackMsgRef.current = 'Ready!';
                        feedbackColorRef.current = '#c8f542'; // Lime
                    } else if (kneeAngle < 160 && kneeAngle > 90) {
                        feedbackMsgRef.current = 'Go deeper!';
                        feedbackColorRef.current = '#f97316'; // Orange
                    }
                }

                if (kneeAngle < 90) {
                    if (stageRef.current === 'up') {
                        stageRef.current = 'down';
                    }
                    feedbackMsgRef.current = 'Good depth! Now up!';
                    feedbackColorRef.current = '#4ade80'; // Green
                }

                if (kneeAngle > 160 && stageRef.current === 'down') {
                    stageRef.current = 'up';
                    repCountRef.current += 1;
                    playBeep();
                    feedbackMsgRef.current = 'Great rep!';
                    feedbackColorRef.current = '#c8f542';
                }

                syncUI();
            }
        });

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener('loadeddata', () => {
                        setCameraReady(true);
                        setModelLoading(false);
                    });
                }
            } catch (err) {
                console.log("Cant get permission");
            }
        }

        startCamera();

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [syncUI]);

    const startDetection = useCallback(() => {
        if (!videoRef.current || !poseRef.current) return;

        const loop = async () => {
            if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
                try {
                    await poseRef.current.send({ image: videoRef.current });
                } catch (e) {}
            }
            animFrameRef.current = requestAnimationFrame(loop);
        };
        loop();
    }, []);

    const handleStart = useCallback(() => {
        setIsActive(true);
        startDetection();
        timerRef.current = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);
    }, [startDetection]);

    const handlePause = useCallback(() => {
        setIsActive(false);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const handleReset = useCallback(() => {
        handlePause();
        repCountRef.current = 0;
        stageRef.current = 'up';
        angleRef.current = 0;
        setReps(0);
        setAngle(0);
        setStage('up');
        setElapsed(0);
        setFeedback({ message: '', color: '#c8f542' });
        feedbackMsgRef.current = '';
        feedbackColorRef.current = '#c8f542';

        const canvasCtx = canvasRef.current?.getContext('2d');
        if (canvasCtx && canvasRef.current) {
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, [handlePause]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.videoSection}>
                <div className={styles.videoWrapper}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={styles.video}
                    />
                    <canvas
                        ref={canvasRef}
                        className={styles.canvas}
                        width={640}
                        height={480}
                    />

                    {modelLoading && (
                        <div className={styles.loadingOverlay}>
                            <div className={styles.spinner} />
                            <span>Loading camera...</span>
                        </div>
                    )}

                    {cameraReady && !isActive && reps === 0 && (
                        <div className={styles.readyOverlay}>
                            <p className={styles.readyText}>Camera ready</p>
                            <p className={styles.readySub}>Hit start when you're in position</p>
                        </div>
                    )}

                    {isActive && (
                        <div className={styles.stageIndicator}>
                            <span className={`${styles.stageDot} ${stage === 'down' ? styles.stageDown : styles.stageUp}`} />
                            <span className={styles.stageLabel}>
                                {stage === 'down' ? 'DOWN' : 'UP'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.panel}>
                {isActive && feedback.message && (
                    <div className={styles.feedbackCard} style={{ borderColor: feedback.color }}>
                        <span className={styles.feedbackText} style={{ color: feedback.color }}>
                            {feedback.message}
                        </span>
                    </div>
                )}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{reps}</span>
                        <span className={styles.statLabel}>Reps</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{angle}°</span>
                        <span className={styles.statLabel}>Knee Angle</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={`${styles.statValue} ${stage === 'down' ? styles.valueDown : ''}`}>
                            {stage === 'down' ? 'Down' : 'Up'}
                        </span>
                        <span className={styles.statLabel}>Phase</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{formatTime(elapsed)}</span>
                        <span className={styles.statLabel}>Time</span>
                    </div>
                </div>

                <div className={styles.exerciseInfo}>
                    <span className={styles.exerciseLabel}>Exercise</span>
                    <span className={styles.exerciseName}>{exerciseName}</span>
                </div>

                <div className={styles.controls}>
                    {!isActive ? (
                        <button
                            className={styles.startBtn}
                            onClick={handleStart}
                            disabled={!cameraReady}
                        >
                            {reps > 0 ? 'Resume' : 'Start'}
                        </button>
                    ) : (
                        <button className={styles.pauseBtn} onClick={handlePause}>
                            Pause
                        </button>
                    )}
                    <button
                        className={styles.resetBtn}
                        onClick={handleReset}
                        disabled={reps === 0 && elapsed === 0}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    )
}