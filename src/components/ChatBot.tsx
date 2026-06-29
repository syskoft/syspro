import { Bot, MessageSquare, Send, X, Paperclip, FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Message { role: 'user' | 'assistant'; text: string }
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function ChatBot() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false); const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(''); const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false); const [file, setFile] = useState<{ name: string; path: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null); const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { const s = sessionStorage.getItem('chatbot_history'); if (s) try { setMessages(JSON.parse(s)) } catch {} } }, [open])
  useEffect(() => { sessionStorage.setItem('chatbot_history', JSON.stringify(messages)) }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || !profile?.emp_ide) return
    if (f.size > MAX_FILE_SIZE) { setMessages((p) => [...p, { role: 'assistant', text: 'El archivo no puede superar los 10MB' }]); return }
    setUploading(true)
    try { const path = `${profile.emp_ide}/${Date.now()}-${f.name}`; const { error } = await supabase.storage.from('chatbot_files').upload(path, f); if (error) throw error; setFile({ name: f.name, path }) }
    catch { setMessages((p) => [...p, { role: 'assistant', text: 'Error al subir el archivo' }]) }
    finally { setUploading(false); e.target.value = '' }
  }

  function removeFile() { if (file) { supabase.storage.from('chatbot_files').remove([file.path]).catch(() => {}); setFile(null) } }

  async function send() {
    const text = input.trim(); if ((!text && !file) || loading || uploading || !profile?.emp_ide) return
    const cf = file; setInput(''); setFile(null)
    setMessages((p) => [...p, { role: 'user', text: text || (cf ? `[Archivo: ${cf.name}]` : '') }]); setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('chatbot', { body: { question: text, history: messages, emp_ide: profile.emp_ide, fileId: cf?.path ?? null } })
      if (error) throw error; setMessages((p) => [...p, { role: 'assistant', text: data.reply ?? 'Sin respuesta' }])
    } catch { setMessages((p) => [...p, { role: 'assistant', text: 'Error al conectar con el asistente.' }]) }
    finally { setLoading(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all" title="Abrir asistente">
      <MessageSquare className="size-5" />
    </button>
  )

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col rounded-xl border bg-card shadow-2xl overflow-hidden">
      <input ref={fileRef} type="file" accept=".pdf,.csv,.xlsx,.xls,.txt,.png,.jpg,.jpeg" onChange={handleFilePick} className="hidden" />
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2"><Bot className="size-4 text-primary" /><span className="text-sm font-medium">Asistente SYSPRO</span></div>
        <button onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="size-4" /></button>
      </div>
      <div className="h-80 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground"><Bot className="mb-2 size-8 opacity-40" /><p>Pregunta sobre tus datos</p><p className="mt-3 text-[10px] opacity-60">Podés adjuntar PDF, Excel, CSV o imágenes</p></div>}
        {messages.map((m, i) => (<div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
          <div className={cn('max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{m.text}</div>
        </div>))}
        {loading && <div className="flex justify-start"><div className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground"><span className="animate-pulse">Pensando...</span></div></div>}
        <div ref={bottomRef} />
      </div>
      {file && <div className="flex items-center gap-2 border-t bg-muted/20 px-3 py-1.5"><FileText className="size-3.5 shrink-0 text-muted-foreground" /><span className="truncate text-xs">{file.name}</span><button onClick={removeFile} className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"><X className="size-3" /></button></div>}
      <div className="border-t p-3"><div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading} title="Adjuntar archivo" className="shrink-0"><Paperclip className="size-4" /></Button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={uploading ? 'Subiendo...' : 'Escribe tu pregunta...'}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
        <Button size="icon" onClick={send} disabled={loading || uploading || (!input.trim() && !file)}><Send className="size-4" /></Button>
      </div></div>
    </div>
  )
}
