import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Play, Pause, Download, Volume2, Music } from 'lucide-react';

export interface SoundOption {
  id: string;
  name: string;
  description: string;
  frequency: number[];
  duration: number[];
  type: OscillatorType;
}

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'classic-bell',
    name: 'Classic Bell',
    description: 'Traditional doorbell chime',
    frequency: [880, 660],
    duration: [0.3, 0.4],
    type: 'sine',
  },
  {
    id: 'modern-chime',
    name: 'Modern Chime',
    description: 'Clean modern notification',
    frequency: [523, 659, 784],
    duration: [0.2, 0.2, 0.3],
    type: 'sine',
  },
  {
    id: 'alert-buzz',
    name: 'Alert Buzz',
    description: 'Urgent attention grabber',
    frequency: [440, 550, 440],
    duration: [0.15, 0.15, 0.2],
    type: 'square',
  },
  {
    id: 'soft-tone',
    name: 'Soft Tone',
    description: 'Gentle notification sound',
    frequency: [392, 523],
    duration: [0.4, 0.5],
    type: 'triangle',
  },
  {
    id: 'door-knock',
    name: 'Door Knock',
    description: 'Rhythmic knock pattern',
    frequency: [200, 200, 200],
    duration: [0.08, 0.08, 0.08],
    type: 'sawtooth',
  },
];

const generateSound = (sound: SoundOption): AudioContext => {
  const ctx = new AudioContext();
  let time = ctx.currentTime;

  sound.frequency.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = sound.type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + sound.duration[i]);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + sound.duration[i]);
    time += sound.duration[i] + 0.05;
  });

  return ctx;
};

const generateWavBlob = (sound: SoundOption): Blob => {
  const sampleRate = 44100;
  let totalDuration = 0;
  sound.duration.forEach((d) => (totalDuration += d + 0.05));
  const numSamples = Math.ceil(sampleRate * totalDuration);
  const buffer = new Float32Array(numSamples);

  let sampleOffset = 0;
  sound.frequency.forEach((freq, i) => {
    const dur = sound.duration[i];
    const samples = Math.ceil(sampleRate * dur);
    for (let s = 0; s < samples; s++) {
      const t = s / sampleRate;
      const envelope = Math.max(0.001, 0.3 * Math.exp(-t * (3 / dur)));
      let value = 0;
      const phase = (2 * Math.PI * freq * t);
      switch (sound.type) {
        case 'sine': value = Math.sin(phase); break;
        case 'square': value = Math.sin(phase) > 0 ? 1 : -1; break;
        case 'triangle': value = (2 / Math.PI) * Math.asin(Math.sin(phase)); break;
        case 'sawtooth': value = 2 * ((freq * t) % 1) - 1; break;
      }
      if (sampleOffset + s < numSamples) {
        buffer[sampleOffset + s] = value * envelope;
      }
    }
    sampleOffset += Math.ceil(sampleRate * (dur + 0.05));
  });

  // Convert to 16-bit PCM WAV
  const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(wavBuffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
};

interface NotificationSoundsProps {
  selectedSound: string;
  onSelectSound: (soundId: string) => void;
}

export const NotificationSounds = ({ selectedSound, onSelectSound }: NotificationSoundsProps) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handlePlay = (sound: SoundOption) => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    if (playingId === sound.id) {
      setPlayingId(null);
      return;
    }
    const ctx = generateSound(sound);
    audioCtxRef.current = ctx;
    setPlayingId(sound.id);
    const totalDur = sound.duration.reduce((a, b) => a + b, 0) + sound.duration.length * 0.05;
    setTimeout(() => setPlayingId(null), totalDur * 1000);
  };

  const handleDownload = (sound: SoundOption) => {
    const blob = generateWavBlob(sound);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sound.id}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Music className="h-5 w-5 text-primary" />
          Notification Sounds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedSound} onValueChange={onSelectSound} className="space-y-3">
          {SOUND_OPTIONS.map((sound) => (
            <div
              key={sound.id}
              className="flex items-center gap-3 rounded-lg border border-input p-3 transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value={sound.id} id={sound.id} />
              <Label htmlFor={sound.id} className="flex-1 cursor-pointer">
                <p className="font-medium text-sm">{sound.name}</p>
                <p className="text-xs text-muted-foreground">{sound.description}</p>
              </Label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.preventDefault(); handlePlay(sound); }}
                >
                  {playingId === sound.id ? (
                    <Pause className="h-4 w-4 text-primary" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.preventDefault(); handleDownload(sound); }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export { SOUND_OPTIONS, generateSound };
