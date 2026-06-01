import { useState, useEffect, useRef, useCallback } from 'react'

const COURSES = [
  'Physics', 'Chemistry', 'Biology', 'English',
  'French', 'Math', 'Philosophy', 'Sport', 'Integrative Science'
]

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 8.5) % 90}%`,
  delay: `${(i * 1.3) % 8}s`,
  duration: `${10 + (i * 1.7) % 8}s`,
  size: `${6 + (i * 2) % 10}px`,
}))

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function App() {
  const [course, setCourse] = useState('Physics')
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [status, setStatus] = useState(null) // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [bgImage, setBgImage] = useState(null)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const fileInputRef = useRef(null)

  // Timer logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const handleStart = () => {
    if (!started) {
      startTimeRef.current = new Date()
      setStarted(true)
    }
    setRunning(true)
    setStatus(null)
  }

  const handlePause = () => setRunning(false)

  const handleEnd = async () => {
    setRunning(false)
    if (seconds === 0) return
    setStatus('loading')

    const duration = Math.round(seconds / 60) || 1
    const date = new Date().toISOString().split('T')[0]

    try {
      const res = await fetch('/api/log-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, duration, date }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to log session')
      }
      setStatus('success')
      setTimeout(() => {
        setSeconds(0)
        setStarted(false)
        setStatus(null)
      }, 3000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  const handleReset = () => {
    setRunning(false)
    setStarted(false)
    setSeconds(0)
    setStatus(null)
  }

  const handleBgUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setBgImage(url)
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">

      {/* Background layer */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          backgroundImage: bgImage
            ? `url(${bgImage})`
            : 'radial-gradient(ellipse at 20% 50%, #1e0b38 0%, #0d0b14 60%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{
        background: bgImage
          ? 'linear-gradient(to bottom, rgba(10,7,20,0.55) 0%, rgba(10,7,20,0.75) 100%)'
          : 'linear-gradient(to bottom, rgba(13,11,20,0.3) 0%, rgba(13,11,20,0.7) 100%)'
      }} />

      {/* Floating petals */}
      {PETALS.map(p => (
        <div key={p.id} className="absolute pointer-events-none" style={{
          left: p.left,
          bottom: '-20px',
          width: p.size,
          height: p.size,
          borderRadius: '50% 0 50% 0',
          background: 'rgba(180,130,255,0.25)',
          animation: `floatPetal ${p.duration} ${p.delay} linear infinite`,
          boxShadow: '0 0 6px rgba(155,109,255,0.3)',
        }} />
      ))}

      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(155,109,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(155,109,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-sm mx-4 fade-in">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.35em] uppercase mb-1" style={{ color: 'var(--purple-soft)', opacity: 0.7 }}>
            ✦ Study Session ✦
          </p>
          <h1 className="font-display text-4xl font-light italic" style={{ color: 'var(--text)' }}>
            Focus Timer
          </h1>
          <div className="mx-auto mt-2 h-px w-24" style={{ background: 'linear-gradient(90deg, transparent, var(--purple), transparent)' }} />
        </div>

        {/* Card body */}
        <div className="rounded-sm p-6" style={{
          background: 'rgba(13,11,20,0.7)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(155,109,255,0.1)',
        }}>

          {/* Course selector */}
          <div className="mb-5">
            <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-dim)' }}>
              Course
            </label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              disabled={started}
              className="w-full rounded-sm px-3 py-2 text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'DM Sans, sans-serif',
                cursor: started ? 'not-allowed' : 'pointer',
                opacity: started ? 0.6 : 1,
              }}
            >
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Timer display */}
          <div className="text-center my-6 relative">
            {running && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rounded-full" style={{
                  width: '120px', height: '120px',
                  border: '1px solid rgba(155,109,255,0.3)',
                  animation: 'pulse-ring 2s ease-out infinite',
                }} />
              </div>
            )}
            <div
              className={`font-display font-light select-none ${running ? 'timer-shimmer' : started ? 'timer-shimmer paused' : ''}`}
              style={{
                fontSize: '4.5rem',
                lineHeight: 1,
                letterSpacing: '0.05em',
                color: !started ? 'rgba(155,109,255,0.5)' : undefined,
              }}
            >
              {formatTime(seconds)}
            </div>
            <p className="text-xs mt-2 tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
              {!started ? 'ready' : running ? 'in session' : 'paused'}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

          {/* Buttons */}
          {status === 'success' ? (
            <div className="text-center py-2 fade-in">
              <p className="font-display italic text-lg mb-1" style={{ color: 'var(--purple-soft)' }}>
                ✦ Session logged successfully ✦
              </p>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {Math.round(seconds / 60) || 1} min · {course}
              </p>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-2 fade-in">
              <p className="text-sm mb-1" style={{ color: 'rgba(255,120,150,0.9)' }}>Failed to log session</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>{errorMsg}</p>
              <button onClick={handleReset} className="btn-secondary text-xs">Reset</button>
            </div>
          ) : status === 'loading' ? (
            <div className="text-center py-3 fade-in">
              <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--purple-soft)', opacity: 0.7 }}>
                Logging to Notion…
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {!running && (
                <button onClick={handleStart} className="btn-primary">
                  {started ? 'Resume' : 'Start'}
                </button>
              )}
              {running && (
                <button onClick={handlePause} className="btn-secondary">Pause</button>
              )}
              {started && (
                <button onClick={handleEnd} className="btn-end">End Session</button>
              )}
              {started && !running && (
                <button onClick={handleReset} className="btn-secondary">Reset</button>
              )}
            </div>
          )}
        </div>

        {/* Background upload */}
        <div className="mt-4 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBgUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="text-xs tracking-widest uppercase transition-all"
            style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = 'var(--purple-soft)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
          >
            ✦ {bgImage ? 'Change Background' : 'Upload Background'} ✦
          </button>
          {bgImage && (
            <button
              onClick={() => setBgImage(null)}
              className="ml-3 text-xs"
              style={{ color: 'rgba(255,100,140,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,140,170,0.9)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,100,140,0.5)'}
            >
              remove
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
