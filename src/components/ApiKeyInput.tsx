
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envApiKey) {
      onApiKeySubmit(envApiKey);
      return;
    }
    const savedApiKey = localStorage.getItem('openaiApiKey');
    if (savedApiKey) {
      onApiKeySubmit(savedApiKey);
    } else {
      setOpen(true);
    }
  }, [onApiKeySubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter your API key.');
      return;
    }
    
    // Simple validation for basic API key format
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      toast.error('Please enter a valid OpenAI API key starting with "sk-"');
      return;
    }
    
    localStorage.setItem('openaiApiKey', apiKey);
    onApiKeySubmit(apiKey);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Key className="h-4 w-4" />
        Update API Key
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter your OpenAI API Key</DialogTitle>
            <DialogDescription>
              Your API key is stored locally on your device and is never sent to our servers.
              You can get an API key from the{" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                OpenAI dashboard
              </a>.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="apiKey"
                  placeholder="sk-..."
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save API Key</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeyInput;
