import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Pill } from '../ui/Pill';

interface VoiceCommand {
  command: string;
  aliases: string[];
  action: () => void;
  category: string;
  description: string;
}

export const VoiceCommandInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice commands configuration
  const commands: VoiceCommand[] = [
    {
      command: 'create report',
      aliases: ['new report', 'make report', 'start report'],
      action: () => {
        window.location.href = '/field/daily-report';
        speak('Opening daily report creator');
      },
      category: 'Reports',
      description: 'Create a new daily field report'
    },
    {
      command: 'scan receipt',
      aliases: ['receipt', 'capture receipt', 'new receipt'],
      action: () => {
        window.location.href = '/field/receipts';
        speak('Opening receipt scanner');
      },
      category: 'Finance',
      description: 'Scan and process a receipt'
    },
    {
      command: 'safety check',
      aliases: ['safety', 'safety inspection', 'check safety'],
      action: () => {
        window.location.href = '/safety/inspection';
        speak('Starting safety inspection');
      },
      category: 'Safety',
      description: 'Start a safety inspection'
    },
    {
      command: 'show projects',
      aliases: ['projects', 'my projects', 'list projects'],
      action: () => {
        window.location.href = '/projects';
        speak('Loading your projects');
      },
      category: 'Projects',
      description: 'View all projects'
    },
    {
      command: 'emergency',
      aliases: ['alert', 'emergency alert', 'send alert'],
      action: () => {
        // Trigger emergency alert system
        speak('Emergency alert activated. Notifying safety team.');
        // In production, this would trigger actual emergency protocols
        console.log('EMERGENCY ALERT TRIGGERED');
      },
      category: 'Safety',
      description: 'Send emergency alert'
    },
    {
      command: 'time clock',
      aliases: ['clock in', 'clock out', 'time'],
      action: () => {
        window.location.href = '/field/time-tracking';
        speak('Opening time tracking');
      },
      category: 'Time',
      description: 'Access time tracking'
    },
    {
      command: 'weather',
      aliases: ['weather report', 'check weather', 'forecast'],
      action: () => {
        window.location.href = '/field/weather';
        speak('Loading weather information');
      },
      category: 'Field',
      description: 'Check weather conditions'
    },
    {
      command: 'help',
      aliases: ['commands', 'what can you do', 'list commands'],
      action: () => {
        setShowCommands(true);
        speak('Here are the available voice commands');
      },
      category: 'System',
      description: 'Show all voice commands'
    }
  ];

  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Process voice command
  const processCommand = useCallback((input: string) => {
    const normalizedInput = input.toLowerCase().trim();
    
    for (const cmd of commands) {
      // Check main command
      if (normalizedInput.includes(cmd.command.toLowerCase())) {
        setStatus('success');
        setFeedback(`Executing: ${cmd.description}`);
        cmd.action();
        return true;
      }
      
      // Check aliases
      for (const alias of cmd.aliases) {
        if (normalizedInput.includes(alias.toLowerCase())) {
          setStatus('success');
          setFeedback(`Executing: ${cmd.description}`);
          cmd.action();
          return true;
        }
      }
    }
    
    setStatus('error');
    setFeedback('Command not recognized. Say "help" for available commands.');
    speak('Sorry, I didn\'t understand that command. Say help for available commands.');
    return false;
  }, [commands]);

  // Initialize speech recognition
  useEffect(() => {
    const browserSupportsRecognition =
      typeof window !== 'undefined' &&
      (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));

    if (!browserSupportsRecognition) {
      setIsSupported(false);
      setFeedback('Voice commands are not supported in this browser. Use Chrome on desktop for full functionality.');
      return () => undefined;
    }

    setIsSupported(true);

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
      setFeedback('Listening for commands...');
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
        setStatus('processing');
        processCommand(final);
      }
      
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      setStatus('error');
      if (event.error === 'not-allowed') {
        setFeedback('Microphone access was denied. Please allow microphone permissions and try again.');
      } else if (event.error === 'network') {
        setFeedback('Network error while processing voice command. Check your connection.');
      } else if (event.error === 'no-speech') {
        setFeedback('No speech detected. Please try again.');
      } else {
        setFeedback(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === 'listening') {
        setStatus('idle');
        setFeedback('');
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [processCommand, status]);

  // Toggle listening
  const toggleListening = () => {
    if (!isSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('idle');
      setFeedback('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        speak('Voice commands activated. How can I help you?');
      } catch (error) {
        console.error('Failed to start voice recognition', error);
        setStatus('error');
        setFeedback('Unable to access the microphone. Please verify permissions and try again.');
        setIsListening(false);
      }
    }
  };

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <div className="relative">
          {/* Status indicator */}
          {isListening && (
            <div className="absolute inset-0 animate-ping">
              <div className="w-full h-full rounded-full bg-amber-500 opacity-75"></div>
            </div>
          )}
          
          {/* Main button */}
          <button
            onClick={toggleListening}
            disabled={!isSupported}
            className={`
              relative w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-110
              ${!isSupported
                ? 'bg-slate-600 cursor-not-allowed'
                : isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-amber-500 hover:bg-amber-600'
              }
              flex items-center justify-center
            `}
            aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
            aria-disabled={!isSupported}
          >
            {!isSupported ? (
              <AlertCircle className="w-8 h-8 text-white" />
            ) : isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          {/* Transcript display */}
          {(transcript || interimTranscript) && (
            <div className="absolute bottom-20 right-0 w-72 p-4 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-500">Voice Input</span>
              </div>
              <p className="text-sm text-white">
                {transcript}
                <span className="text-slate-400">{interimTranscript}</span>
              </p>
            </div>
          )}

          {/* Feedback display */}
          {feedback && (
            <div className={`
              absolute bottom-20 right-0 w-72 p-4 rounded-lg shadow-xl border
              ${status === 'error' 
                ? 'bg-red-900/50 border-red-700' 
                : status === 'success'
                ? 'bg-green-900/50 border-green-700'
                : 'bg-slate-800 border-slate-700'
              }
            `}>
              <div className="flex items-center gap-2">
                {status === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-500" />
                )}
                <p className="text-sm text-white">{feedback}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Commands Help Modal */}
      {showCommands && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Mic className="w-6 h-6 text-amber-500" />
                  Voice Commands
                </h2>
                <button
                  onClick={() => setShowCommands(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(
                  commands.reduce((acc, cmd) => {
                    if (!acc[cmd.category]) acc[cmd.category] = [];
                    acc[cmd.category].push(cmd);
                    return acc;
                  }, {} as Record<string, VoiceCommand[]>)
                ).map(([category, cmds]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-amber-500 mb-2">{category}</h3>
                    <div className="space-y-2">
                      {cmds.map((cmd) => (
                        <div key={cmd.command} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">"{cmd.command}"</p>
                              <p className="text-xs text-slate-400 mt-1">{cmd.description}</p>
                              {cmd.aliases.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="text-xs text-slate-500">Also try:</span>
                                  {cmd.aliases.map(alias => (
                                    <Pill key={alias} size="sm" variant="default">
                                      {alias}
                                    </Pill>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                <p className="text-sm text-amber-400">
                  💡 Tip: Keep commands simple and clear. The system will recognize variations of each command.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
