
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isDisabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  isDisabled = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
      return null;
    }
  };

  const startRecording = async () => {
    if (isDisabled) return;
    
    const stream = await requestMicrophonePermission();
    if (!stream) return;

    setIsRecording(true);
    setRecordingDuration(0);
    audioChunksRef.current = [];

    // Set up timer
    timerRef.current = window.setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    try {
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setIsProcessing(false);
        setRecordingDuration(0);
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      toast({
        title: "Recording failed",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setIsProcessing(true);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center space-x-4 w-full">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isDisabled || isProcessing}
            variant="outline"
            size="sm"
            className="flex-1 max-w-[200px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Record Answer
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="flex-1 max-w-[200px]"
          >
            <MicOff className="mr-2 h-4 w-4" />
            Stop Recording {formatTime(recordingDuration)}
          </Button>
        )}
      </div>
      
      {hasPermission === false && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Voice recording requires microphone permission
        </p>
      )}
    </div>
  );
};

export default VoiceRecorder;
