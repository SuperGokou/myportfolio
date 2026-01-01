import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import useVoice from '../hooks/useVoice';
import HoloCard from './HoloCard';

export default function Overlay() {
    const { status, transcript, response, setStatus, processCommand, triggerGreeting } = useStore();
    const { isListening, transcript: voiceText, startListening, stopListening, setTranscript } = useVoice();
    const [hasStarted, setHasStarted] = useState(false);

    // 1. SEND COMMAND: When user stops speaking, send text to Brain
    useEffect(() => {
        if (!isListening && voiceText) {
            console.log("🚀 User said:", voiceText);
            processCommand(voiceText);
            setTranscript(''); // Clear buffer
        }
    }, [isListening, voiceText, processCommand, setTranscript]);

    // 2. CONVERSATION LOOP: Sync UI & Auto-Restart Mic
    useEffect(() => {
        if (status === 'speaking') {
            stopListening(); // Shut ears while speaking
        }

        if (status === 'idle' && hasStarted) {
            // 💡 THE NATURAL LOOP:
            // If AI is idle (done speaking) and app has started,
            // automatically open the mic again.
            const timer = setTimeout(() => {
                startListening();
            }, 500); // Small delay so he doesn't hear his own echo
            return () => clearTimeout(timer);
        }
    }, [status, hasStarted, startListening, stopListening]);

    // 3. VOICE OUTPUT LOGIC
    useEffect(() => {
        if (status === 'speaking' && response) {
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();

            // LOOK FOR CHINESE VOICES (Alfred speaks Mandarin)
            const preferredVoice = voices.find(v =>
                v.name.includes("Yaoyao") ||    // Microsoft Yaoyao (Very natural)
                v.name.includes("Kangkang") ||  // Microsoft Kangkang (Male)
                v.name.includes("Huihui") ||    // Microsoft Huihui (Female)
                v.name.includes("Google 普通话") // Fallback to Google
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            // IMPORTANT: When he finishes talking, set status back to IDLE
            // so the loop above (Step 2) can restart the mic.
            utterance.onend = () => {
                setStatus('idle');
            };

            window.speechSynthesis.speak(utterance);
        }
    }, [status, response, setStatus]);

    // Handle Initial Start
    const handleStart = () => {
        setHasStarted(true);
        triggerGreeting();
    };

    // --- UI RENDER ---

    // 1. Initial "Click to Start" Screen
    if (!hasStarted) {
        return (
            <div className="overlay" style={{ background: 'rgba(0,0,0,0.9)', pointerEvents: 'auto' }}>
                <div className="center-display">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px #7B2CBF" }}
                        onClick={handleStart}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '20px 40px',
                            fontSize: '1.2rem',
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: '3px',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {/* 👇 UPDATED TEXT */}
                        CONNECT TO ALFRED
                    </motion.button>
                </div>
            </div>
        );
    }

    // 2. Main Interface
    return (
        <div className="overlay" onClick={() => startListening()}>

            {/* Header Info */}
            <div className="header">
                <div className="logo">ALFRED.SYSTEM</div>
                <div className="status" style={{ opacity: 0.5 }}>
                    {status === 'listening' ? 'LISTENING (聆听中)...' :
                        status === 'speaking' ? 'SPEAKING (回答中)...' : 'STANDBY (待命)'}
                </div>
            </div>

            <AnimatePresence>
                <HoloCard />
            </AnimatePresence>

            <div className="center-display">
                <AnimatePresence>
                    {status === 'speaking' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="ai-text"
                        >
                            {response}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="controls">
                <motion.div
                    animate={{
                        opacity: isListening ? 1 : 0.3,
                        scale: isListening ? 1.2 : 1
                    }}
                    style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isListening ? '#FF0055' : 'white',
                        boxShadow: isListening ? '0 0 10px #FF0055' : 'none'
                    }}
                />
            </div>
        </div>
    );
}