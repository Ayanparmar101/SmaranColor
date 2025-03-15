import React, { useState, useRef } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer'; // Added from edited code
import { toast } from 'sonner';
import { Mic } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, StopCircle } from 'lucide-react'; // Added from original code
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DoodleButton from '@/components/DoodleButton';
import ApiKeyInput from '@/components/ApiKeyInput'; // Added from original code


const formSchema = z.object({
  message: z.string().min(1),
});

const VoiceBotPage = () => {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('openai-api-key'));
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string; }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai-api-key', key);
  };

  const startListening = async () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in your browser");
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        console.log("Speech recognition result received", event);
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current.onend = async () => {
        console.log("Speech recognition ended");
        setIsListening(false);
        if (transcript.trim()) {
          await handleSubmitVoice(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.log("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.start();
      toast.success("Listening...");
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      toast.error(`Failed to start speech recognition: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        await handleSubmitVoice(transcript); // Kept from original
      }
    }
  };

  const handleSubmitVoice = async (text: string) => { //Kept from original
    if (!text.trim()) return;

    addMessage(text, 'user');
    setTranscript('');
    await fetchBotResponse(text);
  };

  const addMessage = (text: string, role: "user" | "bot") => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const fetchBotResponse = async (text: string) => {
    try {
      setLoading(true);
      // Replace this with your actual API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, apiKey }),
      });
      
      const data = await response.json();
      addMessage(data.response, 'bot');
    } catch (error) {
      console.error('Error fetching bot response:', error);
      toast.error('Failed to get response from bot');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => { //Kept from original
    const message = values.message.trim();
    if (!message) return;

    addMessage(message, 'user');
    form.reset();
    await fetchBotResponse(message);
  };

  const fetchBotResponse = async (message: string) => { //Kept from original
    if (!apiKey) {
      toast.error('Please add your OpenAI API key first.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a friendly voice assistant for children learning English. Keep your responses simple, encouraging, and suitable for children. Your answers should be detailed, informative and helpful. Avoid giving vague or generic answers. If asked a factual question, provide a proper answer with examples.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 200
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response');
      }

      const data = await response.json();
      const botMessage = data.choices[0].message.content;
      addMessage(botMessage, 'bot');

      // Text-to-speech for bot response
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(botMessage);
        speech.rate = 0.9; // Slightly slower for children
        speech.pitch = 1.1; // Slightly higher pitch

        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Try to find a female English voice
          const englishVoice = voices.find(voice =>
            voice.lang.includes('en') && voice.name.includes('Female')
          ) || voices.find(voice => voice.lang.includes('en')) || voices[0];

          speech.voice = englishVoice;
        }

        window.speechSynthesis.speak(speech);
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-1 container mx-auto max-w-4xl p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-kid-purple">Voice Bot</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-4 h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-24 h-24 bg-kid-purple/10 rounded-full flex items-center justify-center mb-4">
                <Mic className="h-12 w-12 text-kid-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start a Conversation!</h3>
              <p className="text-gray-500 max-w-md">
                Click the "Start Recording" button and speak, or type a message below to chat with the voice bot.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-kid-purple text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {transcript && (
          <div className="bg-gray-100 p-3 rounded-lg mb-4 italic text-gray-700">
            "{transcript}"
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <DoodleButton
            onClick={startListening}
            disabled={isListening || loading}
            color="purple"
            className="w-full"
          >
            Start Recording
          </DoodleButton>

          <DoodleButton
            onClick={stopListening}
            disabled={!isListening || loading}
            color="red"
            className="w-full"
          >
            Stop Recording
          </DoodleButton>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Type your message..."
                      {...field}
                      disabled={loading}
                      className="rounded-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading}
              className="rounded-full bg-kid-purple hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </main>
      <Footer /> {/* Added from edited code */}
    </div>
  );
};

export default VoiceBotPage;