"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role:"user"|"assistant"; content:string; }

const SUGGESTIONS = [
  "Where am I overspending this month?",
  "How can I save more money?",
  "Analyze my spending habits",
  "What's my biggest expense category?",
  "Give me a budget recommendation",
  "How does my spending compare to last month?",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role:"assistant", content:"Hi! I'm your SpendWise AI assistant 🤖\n\nI have access to your real expense data and can give you personalized financial insights. Ask me anything about your spending, budgets, or savings goals!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const send = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Message = { role:"user", content:msg };
    setMessages(p=>[...p,userMsg]);
    setLoading(true);
    try {
      const history = messages.map(m=>({role:m.role,content:m.content}));
      const res = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg,history})});
      const { reply } = await res.json();
      setMessages(p=>[...p,{role:"assistant",content:reply}]);
    } catch {
      setMessages(p=>[...p,{role:"assistant",content:"Sorry, I ran into an error. Please try again."}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-0px)] lg:h-screen overflow-hidden">
      {/* header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-xl font-bold text-gray-900">🤖 AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-0.5">Powered by Groq · Llama 3.3 70B · Knows your real data</p>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
            {m.role==="assistant"&&<div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm shrink-0 mr-2.5 mt-0.5">🤖</div>}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role==="user"?"bg-orange-500 text-white rounded-br-md":"bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm shrink-0 mr-2.5">🤖</div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay:"0ms"}}/>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay:"150ms"}}/>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay:"300ms"}}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* suggestions */}
      {messages.length<=1&&(
        <div className="px-6 pb-3 flex gap-2 flex-wrap shrink-0">
          {SUGGESTIONS.map(s=>(
            <button key={s} onClick={()=>send(s)} className="text-xs bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-sm">{s}</button>
          ))}
        </div>
      )}

      {/* input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask about your spending, budgets, or savings…"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all max-h-32"
            style={{minHeight:"48px"}}
          />
          <button
            onClick={()=>send()}
            disabled={!input.trim()||loading}
            className="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading?<span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>:<span className="text-lg">↑</span>}
          </button>
        </div>
        <p className="text-[10.5px] text-gray-400 mt-2 text-center">Enter to send · Shift+Enter for new line · AI uses your real transaction data</p>
      </div>
    </div>
  );
}