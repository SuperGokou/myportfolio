import { create } from 'zustand';
import { processInput } from './utils/brain';

export const useStore = create((set) => ({
    status: 'idle',
    transcript: '',
    response: '', // Text stays here until overwritten
    visualContent: null,

    setStatus: (status) => set({ status }),
    setTranscript: (text) => set({ transcript: text }),

    processCommand: async (command) => {
        // 1. CLEAR OLD TEXT when starting a new command
        set({ status: 'processing', transcript: command, response: '' });

        try {
            const result = await processInput(command);

            set({
                status: 'speaking',
                response: result.text,
                visualContent: result.data
            });

        } catch (error) {
            set({ status: 'speaking', response: "系统遇到错误。" });
        }

        // NOTE: We REMOVED the setTimeout that cleared the response here.
        // The status will be handled by the voice 'onend' event in Overlay.jsx
    },

    triggerGreeting: () => {
        set({
            status: 'speaking',
            response: "瀚林少爷，Alfred 随时为您效劳。请问今日有何吩咐？"
        });
        // NOTE: We REMOVED the timeout here too.
    },

    closeVisual: () => set({ visualContent: null })
}));