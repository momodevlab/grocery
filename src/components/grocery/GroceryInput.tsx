'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, ClipboardPaste, Mic, MicOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { GroceryItem } from '@/types'

function generateId() {
  return Math.random().toString(36).slice(2)
}

function parseRawText(text: string): GroceryItem[] {
  return text
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Try to parse "2 lbs chicken breast" or "chicken breast 2 lbs"
      const match = line.match(/^(\d+(?:\.\d+)?)\s*(lbs?|oz|kg|g|cups?|tbsp|tsp|dozen|pack|bag|box|can|jar|bottle|bunch|head|clove|slice)?\s+(.+)$/i)
      if (match) {
        return {
          id: generateId(),
          qty: parseFloat(match[1]),
          unit: match[2]?.toLowerCase() ?? '',
          name: match[3].trim(),
        }
      }
      // No quantity — default to 1
      return { id: generateId(), qty: 1, unit: '', name: line }
    })
}

export default function GroceryInput() {
  const { items, addItem, removeItem, updateItem, setItems } = useAppStore()
  const [inputValue, setInputValue] = useState('')
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null)

  function handleAddItem() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const [parsed] = parseRawText(trimmed)
    if (parsed) addItem(parsed)
    setInputValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  function handlePasteSubmit() {
    if (!pasteText.trim()) return
    const parsed = parseRawText(pasteText)
    setItems([...items, ...parsed])
    setPasteText('')
    setPasteMode(false)
  }

  function startListening() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Try Chrome.')
      return
    }
    const SpeechRecognitionAPI =
      (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const parsed = parseRawText(transcript)
        parsed.forEach((item) => addItem(item))
      }
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognition.start()
    setListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div className="space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Add an item (e.g. "2 lbs chicken breast")'
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-sm"
          aria-label="Add grocery item"
        />
        <button
          onClick={handleAddItem}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-3 transition-colors flex items-center gap-1.5 font-medium text-sm"
          aria-label="Add item"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setPasteMode(!pasteMode)}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
          aria-label="Paste a list"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          Paste list
        </button>
        <button
          onClick={listening ? stopListening : startListening}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
            listening
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
          }`}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
        >
          {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {listening ? 'Stop listening' : 'Voice input'}
        </button>
      </div>

      {/* Paste mode textarea */}
      {pasteMode && (
        <div className="animate-fade-in bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <p className="text-xs text-amber-700 font-medium">
            Paste your list below — one item per line, or comma-separated
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"milk\n2 lbs chicken breast\nbread, butter, eggs\n3 cans black beans"}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
            aria-label="Paste grocery list"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePasteSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add to list
            </button>
            <button
              onClick={() => { setPasteMode(false); setPasteText('') }}
              className="text-stone-500 hover:text-stone-700 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Item list */}
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-stone-100 group animate-fade-in"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <span className="text-stone-400 text-xs w-5 text-right shrink-0">{idx + 1}</span>
              <input
                type="number"
                value={item.qty}
                onChange={(e) => updateItem(item.id, { qty: parseFloat(e.target.value) || 1 })}
                min={0.1}
                step={0.1}
                className="w-12 text-center text-sm border border-stone-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                aria-label={`Quantity for ${item.name}`}
              />
              <input
                type="text"
                value={item.unit}
                onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                placeholder="unit"
                className="w-14 text-center text-sm border border-stone-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-orange-400 text-stone-500"
                aria-label={`Unit for ${item.name}`}
              />
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                className="flex-1 text-sm border-transparent bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400 rounded-lg px-1 py-1 text-stone-900"
                aria-label="Item name"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="text-stone-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-stone-400 text-sm">
          <ShoppingCartEmpty />
          <p className="mt-3">Your list is empty — add some items above</p>
        </div>
      )}
    </div>
  )
}

function ShoppingCartEmpty() {
  return (
    <div className="flex justify-center">
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-stone-300" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
    </div>
  )
}
