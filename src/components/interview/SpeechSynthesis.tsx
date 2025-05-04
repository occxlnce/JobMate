
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpeechSynthesisProps {
  text: string;
  autoPlay?: boolean;
}

const SpeechSynthesis: React.FC<SpeechSynthesisProps> = ({ 
  text, 
  autoPlay = false 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }

    // Cleanup on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && speechSupported && text && !isSpeaking) {
      speak();
    }
  }, [text, autoPlay]);

  const speak = () => {
    if (!speechSupported) {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support speech synthesis.",
        variant: "destructive"
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and select a good one if possible
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.includes('en-'));
    
    if (englishVoices.length > 0) {
      // Prefer natural sounding voices
      const preferredVoice = englishVoices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Samantha')
      ) || englishVoices[0];
      
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.9; // Slightly slower than default
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!speechSupported) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isSpeaking ? stopSpeaking : speak}
      className="flex-shrink-0"
    >
      {isSpeaking ? (
        <>
          <VolumeX className="h-4 w-4 mr-1" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 mr-1" />
          Listen
        </>
      )}
    </Button>
  );
};

export default SpeechSynthesis;
