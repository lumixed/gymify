'use client'

import {useEffect, useRef} from 'react'

export default function CameraView() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(()=>{
        const startCamera = async ()=>{
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: { width: 1280, height: 720 }});
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.log("Cant get permission");
            }
        }
        startCamera();

        return ()=>{
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    },[])

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline></video>
        </div>
    )
}