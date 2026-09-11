import { useEffect, useRef, useState } from 'react'

const HISTORY_KEY = 'text2sql-chats'
const prompts = ['Which product has the highest total sales?', 'Show total sales by delivery region.', 'What was the total education budget in 2017?']
const createChat = () => ({ id: crypto.randomUUID(), title: 'New conversation', updatedAt: Date.now(), messages: [] })

function Icon({ name, size = 18 }) {
  const paths = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />, panel: <><path d="M4 5h16v14H4z" /><path d="M9 5v14" /></>,
    plus: <path d="M12 5v14M5 12h14" />, chat: <path d="M20 11.5a7.5 7.5 0 0 1-8 7.48A8.5 8.5 0 0 1 8.3 18L4 20l1.36-3.68A7.5 7.5 0 1 1 20 11.5Z" />,
    database: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v7c0 1.66 3.13 3 7 3s7-1.34 7-3V5M5 12v7c0 1.66 3.13 3 7 3s7-1.34 7-3v-7" /></>,
    send: <><path d="m21 3-7.5 18-3.6-7.9L3 9.5 21 3Z" /><path d="m9.9 13.1 4.5-4.5" /></>, copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></>,
    trash: <><path d="M4 7h16M10 11v5M14 11v5M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function App() {
  const [chats, setChats] = useState(() => { try { const saved = JSON.parse(localStorage.getItem(HISTORY_KEY)); return Array.isArray(saved) && saved.length ? saved : [createChat()] } catch { return [createChat()] } })
  const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0]
  useEffect(() => localStorage.setItem(HISTORY_KEY, JSON.stringify(chats)), [chats])

  function startNewChat() { const chat = createChat(); setChats((current) => [chat, ...current]); setActiveChatId(chat.id); setQuestion(''); inputRef.current?.focus() }
  function deleteChat(event, id) { event.stopPropagation(); setChats((current) => { const next = current.filter((chat) => chat.id !== id); const remaining = next.length ? next : [createChat()]; if (id === activeChatId) setActiveChatId(remaining[0].id); return remaining }) }
  function updateActiveChat(updater) { setChats((current) => current.map((chat) => chat.id === activeChat.id ? updater(chat) : chat)) }

  async function submitQuestion(event) {
    event?.preventDefault(); const prompt = question.trim()
    if (!prompt || isLoading || !activeChat) return
    const userMessage = { id: crypto.randomUUID(), role: 'user', content: prompt }
    updateActiveChat((chat) => ({ ...chat, title: chat.messages.length ? chat.title : prompt, updatedAt: Date.now(), messages: [...chat.messages, userMessage] }))
    setQuestion(''); setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/query`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: prompt }) })
      if (!response.ok) throw new Error('The database agent could not complete that request.')
      const data = await response.json()
      updateActiveChat((chat) => ({ ...chat, updatedAt: Date.now(), messages: [...chat.messages, { id: crypto.randomUUID(), role: 'assistant', content: data.answer ?? 'The query completed successfully.', sql: data.sql, rows: data.rows }] }))
    } catch (error) {
      updateActiveChat((chat) => ({ ...chat, updatedAt: Date.now(), messages: [...chat.messages, { id: crypto.randomUUID(), role: 'assistant', isError: true, content: `${error.message} Start the Python API, then try again.` }] }))
    } finally { setIsLoading(false) }
  }
  async function copySql(sql) { await navigator.clipboard.writeText(sql); setCopied(true); window.setTimeout(() => setCopied(false), 1600) }

  return <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
    <aside className="sidebar" aria-label="Chat navigation">
      <div className="brand-row"><div className="brand-mark"><Icon name="database" size={19} /></div><span className="brand-name">Text2SQL</span><button className="icon-button collapse-button" onClick={() => setIsSidebarOpen(false)} aria-label="Collapse navigation"><Icon name="panel" /></button></div>
      <button className="new-chat-button" onClick={startNewChat}><Icon name="plus" /> <span>New chat</span></button>
      <div className="history-heading">History</div>
      <nav className="chat-list" aria-label="Chat history">{chats.slice().sort((a, b) => b.updatedAt - a.updatedAt).map((chat) => <div key={chat.id} className={`chat-item ${chat.id === activeChat?.id ? 'active' : ''}`} role="button" tabIndex="0" onClick={() => setActiveChatId(chat.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveChatId(chat.id) }}><Icon name="chat" size={16} /><span>{chat.title}</span><button className="delete-button" onClick={(event) => deleteChat(event, chat.id)} aria-label={`Delete ${chat.title}`}><Icon name="trash" size={15} /></button></div>)}</nav>
      <div className="sidebar-footer"><span className="status-dot" />Database agent</div>
    </aside>
    <main className="workspace">
      <header className="topbar"><button className="icon-button menu-button" onClick={() => setIsSidebarOpen((open) => !open)} aria-label="Toggle navigation"><Icon name="menu" /></button><div className="chat-title">{activeChat?.title === 'New conversation' ? 'New chat' : activeChat?.title}</div><button className="topbar-new" onClick={startNewChat}><Icon name="plus" size={16} /><span>New chat</span></button></header>
      <section className={`conversation ${activeChat?.messages.length ? 'has-messages' : ''}`}>
        {!activeChat?.messages.length ? <div className="welcome"><div className="welcome-icon"><Icon name="database" size={31} /></div><p className="eyebrow">AI DATABASE ASSISTANT</p><h1>Ask your data anything.</h1><p className="welcome-copy">Use plain English. I’ll generate SQL, validate it, and return the answer from your database.</p><div className="prompt-grid">{prompts.map((prompt) => <button key={prompt} onClick={() => setQuestion(prompt)}>{prompt}<span>↗</span></button>)}</div></div> : <div className="messages">{activeChat.messages.map((message) => <article key={message.id} className={`message ${message.role} ${message.isError ? 'error' : ''}`}><div className="message-avatar">{message.role === 'user' ? 'You' : <Icon name="database" size={16} />}</div><div className="message-content"><p>{message.content}</p>{message.sql && <div className="sql-block"><div><span>Generated SQL</span><button onClick={() => copySql(message.sql)}><Icon name="copy" size={14} />{copied ? 'Copied' : 'Copy'}</button></div><pre><code>{message.sql}</code></pre></div>}{Array.isArray(message.rows) && message.rows.length > 0 && <div className="results-table"><table><thead><tr>{Object.keys(message.rows[0]).map((key) => <th key={key}>{key.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{message.rows.map((row, index) => <tr key={index}>{Object.values(row).map((value, cellIndex) => <td key={cellIndex}>{String(value)}</td>)}</tr>)}</tbody></table></div>}</div></article>)}{isLoading && <article className="message assistant"><div className="message-avatar"><Icon name="database" size={16} /></div><div className="thinking"><i /><i /><i /> Querying your database</div></article>}</div>}
      </section>
      <form className="composer" onSubmit={submitQuestion}><textarea ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) submitQuestion(event) }} placeholder="Ask a question about your database..." rows="1" aria-label="Database question" /><button type="submit" disabled={!question.trim() || isLoading} aria-label="Send question"><Icon name="send" size={18} /></button><p>Enter to send <span>·</span> Shift + Enter for a new line</p></form>
    </main>
  </div>
}

export default App
