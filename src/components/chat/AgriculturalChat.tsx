import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, ArrowDown } from 'lucide-react';
import { PromptInput } from '@/components/ui/prompt-input';
import { PromptInputTextarea } from '@/components/ui/prompt-input';
import { PromptInputActions } from '@/components/ui/prompt-input';
import { PromptInputAction } from '@/components/ui/prompt-input';
import { WelcomeScreen } from './WelcomeScreen';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { FluidBackground } from '@/components/ui/FluidBackground';
import { useChatStream } from './useChatStream';

function ModeToggle({ mode, setMode }: { mode: string; setMode: (m: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 4, background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 9999 }}>
      <button
        onClick={() => setMode('paysan')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999,
          fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
          background: mode === 'paysan' ? 'linear-gradient(135deg, var(--cyan-500), var(--ai-500))' : 'transparent',
          color: mode === 'paysan' ? 'white' : 'var(--text-muted)',
          boxShadow: mode === 'paysan' ? '0 2px 12px rgba(6, 182, 212, 0.4)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        Paysan
      </button>
      <button
        onClick={() => setMode('expert')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999,
          fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
          background: mode === 'expert' ? 'linear-gradient(135deg, var(--cyan-500), var(--ai-500))' : 'transparent',
          color: mode === 'expert' ? 'white' : 'var(--text-muted)',
          boxShadow: mode === 'expert' ? '0 2px 12px rgba(6, 182, 212, 0.4)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        Expert
      </button>
    </div>
  );
}

export function AgriculturalChat() {
  const [inputValue, setInputValue] = useState('');
  const [userMode, setUserMode] = useState('expert');
  const { messages, isStreaming, sendMessage, stopStreaming } = useChatStream();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollTop + clientHeight < scrollHeight - 100);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const agriculturalSuggestions = [
    { label: 'Variétés riz sol rouge Analamanga', subtitle: 'Conseils de plantation' },
    { label: 'Maladies du riz par région', subtitle: 'Diagnostic & traitement' },
    { label: 'Prévisions météo agricoles', subtitle: 'Climat & saisons' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'transparent', position: 'relative' }}>
      <FluidBackground />
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'transparent',
        padding: '16px 32px',
      }}>
        <div>

        </div>
        <ModeToggle mode={userMode} setMode={setUserMode} />
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        data-chat-container
        style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', position: 'relative' }}
      >
        {messages.length === 0 ? (
          <WelcomeScreen suggestions={agriculturalSuggestions} onSelect={sendMessage} />
        ) : (
          <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg =>
              msg.sender === 'user' ? (
                <UserMessage key={msg.id} text={msg.text} />
              ) : (
                <AssistantMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={isStreaming}
                  onStop={stopStreaming}
                  mode={userMode}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <div style={{ position: 'absolute', bottom: 120, right: 48, zIndex: 10 }}>
          <button
            onClick={scrollToBottom}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-muted)', cursor: 'pointer', backdropFilter: 'blur(12px)',
            }}
          >
            <ArrowDown size={16} />
          </button>
        </div>
      )}

      {/* Prompt Input */}
      <div style={{
        background: 'transparent',
        padding: '16px 32px',
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <PromptInput isLoading={isStreaming} className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
              <PromptInputTextarea
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                placeholder="Posez votre question agricole..."
                className="text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <PromptInputActions>
                <PromptInputAction tooltip="Dictée vocale">
                  <button
                    type="button"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 10,
                      background: 'transparent', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    <Mic size={16} />
                  </button>
                </PromptInputAction>
                <PromptInputAction tooltip="Envoyer">
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isStreaming}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 40, height: 40, borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--cyan-500), var(--agri-500))',
                      color: 'white', border: 'none', cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                      opacity: !inputValue.trim() || isStreaming ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Send size={16} />
                  </button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>
          </form>
        </div>
      </div>
    </div>
  );
}
