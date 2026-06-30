'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { calculateAngle, playBeep } from './utils'
import { saveSession } from '@/lib/history'
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
    const minAngleRef = useRef<number>(180);
    const repScoresRef = useRef<number[]>([]);
    const activeSideRef = useRef<'Left' | 'Right'>('Left');
    const lastSpeechRef = useRef<string>('');
    const voiceEnabledRef = useRef<boolean>(true);

    const [isActive, setIsActive] = useState(false);
    const [reps, setReps] = useState(0);
    const [angle, setAngle] = useState(0);
    const [stage, setStage] = useState<'up' | 'down'>('up');
    const [elapsed, setElapsed] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [feedback, setFeedback] = useState({ message: '', color: '#c8f542' });
    const [repScores, setRepScores] = useState<number[]>([]);
    const [activeSide, setActiveSide] = useState<'Left' | 'Right'>('Left');
    const [mirrorCamera, setMirrorCamera] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const setFeedbackAndSpeak = (msg: string, color: string) => {
        feedbackMsgRef.current = msg;
        feedbackColorRef.current = color;

        if (voiceEnabledRef.current && msg !== lastSpeechRef.current && msg !== 'Ready!') {
            // Cancel any ongoing speech to give immediate feedback
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(msg);
                utterance.rate = 1.1; // Slightly faster for workout pace
                window.speechSynthesis.speak(utterance);
                lastSpeechRef.current = msg;
            }
        }
    };

    const syncUI = useCallback(() => {
        setReps(repCountRef.current);
        setAngle(Math.round(angleRef.current));
        setStage(stageRef.current);
        setFeedback({ message: feedbackMsgRef.current, color: feedbackColorRef.current });
        setRepScores([...repScoresRef.current]);
        setActiveSide(activeSideRef.current);
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

                // Bilateral detection: determine which side has higher average visibility
                const leftVis = (landmarks[23].visibility + landmarks[25].visibility + landmarks[27].visibility) / 3;
                const rightVis = (landmarks[24].visibility + landmarks[26].visibility + landmarks[28].visibility) / 3;
                const isLeftVisible = leftVis >= rightVis;
                
                activeSideRef.current = isLeftVisible ? 'Left' : 'Right';

                const hipIdx = isLeftVisible ? 23 : 24;
                const kneeIdx = isLeftVisible ? 25 : 26;
                const ankleIdx = isLeftVisible ? 27 : 28;

                const hip = { x: landmarks[hipIdx].x, y: landmarks[hipIdx].y };
                const knee = { x: landmarks[kneeIdx].x, y: landmarks[kneeIdx].y };
                const ankle = { x: landmarks[ankleIdx].x, y: landmarks[ankleIdx].y };

                const kneeAngle = calculateAngle(hip, knee, ankle);
                angleRef.current = kneeAngle;

                if (stageRef.current === 'down') {
                    if (kneeAngle < minAngleRef.current) {
                        minAngleRef.current = kneeAngle;
                    }
                }

                if (stageRef.current === 'up') {
                    if (kneeAngle > 160) {
                        setFeedbackAndSpeak('Ready!', '#c8f542');
                    } else if (kneeAngle < 160 && kneeAngle > 90) {
                        setFeedbackAndSpeak('Go deeper!', '#f97316');
                    }
                }

                if (kneeAngle < 90) {
                    if (stageRef.current === 'up') {
                        stageRef.current = 'down';
                        minAngleRef.current = kneeAngle; // Reset minimum angle for new rep
                    }
                    setFeedbackAndSpeak('Good depth! Now up!', '#4ade80');
                }

                if (kneeAngle > 160 && stageRef.current === 'down') {
                    stageRef.current = 'up';
                    repCountRef.current += 1;
                    playBeep();
                    
                    let score = 100;
                    if (minAngleRef.current > 70) {
                        score = Math.max(0, 100 - (minAngleRef.current - 70) * 2);
                    }
                    repScoresRef.current.push(Math.round(score));
                    if (repScoresRef.current.length > 5) {
                        repScoresRef.current.shift(); // keep last 5
                    }

                    // For the speech, let's just say "Great rep" or "Good rep" to be concise, 
                    // instead of reading out the score number every time.
                    const speechMsg = score > 85 ? 'Great rep!' : 'Good rep!';
                    
                    feedbackMsgRef.current = `Great rep! Score: ${Math.round(score)}`;
                    feedbackColorRef.current = '#c8f542';

                    if (voiceEnabledRef.current) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(speechMsg);
                        utterance.rate = 1.1;
                        window.speechSynthesis.speak(utterance);
                        lastSpeechRef.current = speechMsg;
                    }
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

        if (repCountRef.current > 0) {
            const scores = [...repScoresRef.current];
            const avg = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;
            saveSession({
                exercise: exerciseName,
                reps: repCountRef.current,
                avgScore: avg,
                duration: elapsed,
                side: activeSideRef.current,
                scores,
            });
        }

        repCountRef.current = 0;
        stageRef.current = 'up';
        angleRef.current = 0;
        setReps(0);
        setAngle(0);
        setStage('up');
        setElapsed(0);
        setFeedback({ message: '', color: '#c8f542' });
        setRepScores([]);
        feedbackMsgRef.current = '';
        feedbackColorRef.current = '#c8f542';
        lastSpeechRef.current = '';
        repScoresRef.current = [];
        minAngleRef.current = 180;

        const canvasCtx = canvasRef.current?.getContext('2d');
        if (canvasCtx && canvasRef.current) {
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, [handlePause, exerciseName, elapsed]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const avgScore = repScores.length > 0 ? Math.round(repScores.reduce((a, b) => a + b, 0) / repScores.length) : 0;

    return (
        <div className={styles.container}>
            <div className={styles.videoSection}>
                <div className={styles.videoWrapper}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={styles.video}
                        style={{ transform: mirrorCamera ? 'scaleX(-1)' : 'none' }}
                    />
                    <canvas
                        ref={canvasRef}
                        className={styles.canvas}
                        width={640}
                        height={480}
                        style={{ transform: mirrorCamera ? 'scaleX(-1)' : 'none' }}
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

                <div className={styles.scoresSection}>
                    <div className={styles.avgScoreCard}>
                        <span className={styles.avgScoreValue}>{avgScore > 0 ? avgScore : '-'}</span>
                        <span className={styles.avgScoreLabel}>Average Form Score</span>
                    </div>
                    {repScores.length > 0 && (
                        <div className={styles.recentScores}>
                            <span className={styles.recentScoresLabel}>Recent Reps:</span>
                            <div className={styles.scoreDots}>
                                {repScores.map((score, idx) => (
                                    <div 
                                        key={idx} 
                                        className={styles.scoreDot}
                                        style={{ backgroundColor: score >= 90 ? '#4ade80' : score >= 70 ? '#facc15' : '#ef4444' }}
                                        title={`Score: ${score}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.exerciseInfo}>
                    <div className={styles.exerciseInfoRow}>
                        <span className={styles.exerciseLabel}>Exercise</span>
                        <span className={styles.exerciseName}>{exerciseName}</span>
                    </div>
                    <div className={styles.exerciseInfoRow}>
                        <span className={styles.exerciseLabel}>Tracking Side</span>
                        <span className={styles.exerciseName}>{activeSide}</span>
                    </div>
                </div>

                <div className={styles.toggleRow}>
                    <label className={styles.toggleLabel}>
                        <input 
                            type="checkbox" 
                            checked={mirrorCamera} 
                            onChange={() => setMirrorCamera(prev => !prev)} 
                            className={styles.toggleInput}
                        />
                        <span className={styles.toggleText}>Mirror Camera</span>
                    </label>
                    <label className={styles.toggleLabel}>
                        <input 
                            type="checkbox" 
                            checked={voiceEnabled} 
                            onChange={() => {
                                setVoiceEnabled(prev => {
                                    voiceEnabledRef.current = !prev;
                                    return !prev;
                                });
                            }} 
                            className={styles.toggleInput}
                        />
                        <span className={styles.toggleText}>AI Voice Coach</span>
                    </label>
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