'use client';

import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMicrophone } from '@tabler/icons-react';
import React, { useRef, useState } from 'react';

// import PulsingFab from "./pulsing-button";
import { cn } from '@/utils/class';

interface VoiceButtonForm {
  language: string;
  onTranscribe: (voiceTranscription: string) => void;
  existingTexts: string;
  onUnsupportDetected: () => void;
  onAudioRecorded?: (audioBlob: Blob) => void;
}

const punctuations = {
  ' comma': ',',
  ' period': '.',
  ' question mark': '?',
  ' exclamation mark': '!',
  ' semicolon': ';',
  ' colon': ':',
  ' dash': '-',
};

const VoiceToTextButton: React.FC<VoiceButtonForm> = ({
  language,
  onTranscribe,
  existingTexts,
  onUnsupportDetected,
  // onAudioRecorded,
}) => {
  const [isListening, setIsListening] = useState(false);
  // const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const recognitionInstance = useRef<any>(null);

  // const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
  //   null,
  // );
  const persistentListening = useRef(false);
  // const audioChunks = useRef<BlobPart[]>([]);

  const SpeechRecognition =
    (typeof window !== 'undefined' && (window as any).SpeechRecognition) ||
    (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

  if (!SpeechRecognition) {
    onUnsupportDetected();
    return;
  }

  const handlePersistentListening = () => {
    if (persistentListening.current === true) {
      recognitionInstance.current.start();
      setTimeout(() => {
        persistentListening.current = false;
        setIsListening(false);
        recognitionInstance.current.stop();
        recognitionInstance.current = null;
      }, 300000); // Five minute standy after restart for any speech before termination
      return;
    }
  };

  const initializeRecognition = () => {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handlePersistentListening;

    recognitionInstance.current = recognition;

    return recognition;
  };

  const handleRecognitionResult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = existingTexts;

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += ` ${processTranscription(result[0].transcript, result.isFinal)}`;
      } else {
        interimTranscript += ` ${processTranscription(result[0].transcript, result.isFinal)}`;
      }
    }

    const uniqueInterim = Array.from(
      new Set(interimTranscript.trim().split(' ')),
    ).join(' ');
    const updatedTranscript = `${finalTranscript} ${uniqueInterim}`
      .replace(/\s+/g, ' ')
      .trim();

    onTranscribe(updatedTranscript);

    onTranscribe(updatedTranscript);
  };

  const handleRecognitionError = (event: any) => {
    let message = event.error;
    let severity: 'yellow' | 'red' = 'red';

    if (event.error === 'no-speech') {
      message = 'Do you want to say something?';
      severity = 'yellow';
    } else if (event.error === 'aborted') {
      message = 'Sorry! Your message was aborted. Please try again!';
    }

    notifications.show({
      title: 'Regcognition ERROR',
      message: message,
      color: severity,
    });
  };

  const startListening = async () => {
    const recognition = initializeRecognition();
    setIsListening(true);
    recognition.start();
    persistentListening.current = true;

    // try {
    //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //   const recorder = new MediaRecorder(stream);

    //   recorder.ondataavailable = (event) => {
    //      if (event.data.size > 0) {
    //        audioChunks.current.push(event.data);
    //      }
    //   };

    //   recorder.onstop = () => {
    //     const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    //     audioChunks.current = []; // Reset chunks
    //     onAudioRecorded?.(audioBlob);
    //   };

    //   recorder.start();
    //   setMediaRecorder(recorder);

    // } catch (error) {
    //   console.error('Error accessing audio stream:', error);
    //   notifications.show({
    //     title: 'Audio stream accessing error',
    //     message: 'Unable to access microphone.',
    //     color: 'red',
    //   });
    // }
  };

  const stopListening = () => {
    // Stop Speech Recognition
    if (recognitionInstance) {
      persistentListening.current = false;
      recognitionInstance.current.stop();
      recognitionInstance.current = null;
    }

    // // Stop Media Recorder
    // if (mediaRecorder) {
    //   mediaRecorder.stop();
    //   setMediaRecorder(null);
    // }

    // // Stop all tracks in the media stream
    // if (mediaRecorder?.stream) {
    //   mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    // }

    setIsListening(false);
  };

  const processTranscription = (rawText: string, isFinal: boolean) => {
    const capitalized = isFinal
      ? rawText.charAt(0).toUpperCase() + rawText.slice(1)
      : rawText;
    return capitalized
      .replace(
        /(\s)(comma|period|question mark|exclamation mark|semicolon|colon|dash)/gi,
        (match) => (punctuations as any)[match] || match,
      )
      .replace(/([.!?]\s)(\w)/g, (s) => s.toUpperCase())
      .replace(/([-,:;]\s)(\w)/g, (s) => s.toLowerCase());
  };

  return (
    // <PulsingFab
    //     isPulsing={isListening}
    //     onClick={listeningEventTrigger}
    // >
    //     <IconMicrophone className="size-5" />
    // </PulsingFab>
    <ActionIcon
      className={cn(
        'absolute bg-base-black hover:bg-base-black/90 text-white right-4 bottom-7 rounded-full',
        isListening && 'bg-red-500 hover:bg-red-600',
      )}
      size="xl"
      type="button"
      onClick={isListening ? stopListening : startListening}
    >
      <IconMicrophone className="size-5" />
    </ActionIcon>
  );
};

export default VoiceToTextButton;
