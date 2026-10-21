/**
 * The hero background: a faint maze in which A* keeps finding its way to the
 * cursor — the same algorithm as in the pathfinding project, running live.
 * Each new route is drawn in the colour of the next project on the page.
 *
 * It only animates while the hero is on screen and the tab is visible, and
 * with prefers-reduced-motion it draws one still route and stops.
 */

const CELL = 22

interface Search {
  visited: Int32Array // cells in the order A* settled them
  path: number[] // goal → start
  startedAt: number
  colour: string
}

export function startField(canvas: HTMLCanvasElement, colours: string[]): void {
  const ctx = canvas.getContext('2d')!
  const host = canvas.parentElement!
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches

  let cols = 0
  let rows = 0
  let open = new Uint8Array(0) // 1 = corridor
  let start = 0
  let goal = -1
  let current: Search | null = null
  let previous: Search | null = null
  let colourIndex = 0
  let raf = 0
  let visible = true
  let lastPointer = 0
  let ink = '#24262b'

  // ── maze ──────────────────────────────────────────────────────────────

  function build(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = host.clientWidth
    const h = host.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || ink

    cols = Math.max(9, Math.floor(w / CELL) | 1)
    rows = Math.max(9, Math.floor(h / CELL) | 1)
    open = new Uint8Array(cols * rows)

    // Recursive backtracker on odd cells, then knock out some walls so A*
    // has real choices to make instead of a single corridor.
    let seed = 20261021
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const stack = [cols + 1]
    open[cols + 1] = 1
    while (stack.length) {
      const cell = stack[stack.length - 1]
      const r = Math.floor(cell / cols)
      const c = cell % cols
      const next: number[] = []
      for (const [dr, dc] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr > 0 && nc > 0 && nr < rows - 1 && nc < cols - 1 && !open[nr * cols + nc]) next.push(nr * cols + nc)
      }
      if (!next.length) {
        stack.pop()
        continue
      }
      const n = next[Math.floor(rand() * next.length)]
      open[(cell + n) / 2] = 1
      open[n] = 1
      stack.push(n)
    }
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const i = r * cols + c
        if (open[i] || rand() > 0.14) continue
        if ((open[i - 1] && open[i + 1]) !== (open[i - cols] && open[i + cols])) open[i] = 1
      }
    }
    start = nearestOpen(rows - 2, 1)
    current = previous = null
    goal = -1
  }

  function nearestOpen(r: number, c: number): number {
    r = Math.max(1, Math.min(rows - 2, r))
    c = Math.max(1, Math.min(cols - 2, c))
    for (let d = 0; d < Math.max(rows, cols); d++) {
      for (let dr = -d; dr <= d; dr++) {
        for (let dc = -d; dc <= d; dc++) {
          const rr = r + dr
          const cc = c + dc
          if (rr > 0 && cc > 0 && rr < rows - 1 && cc < cols - 1 && open[rr * cols + cc]) return rr * cols + cc
        }
      }
    }
    return cols + 1
  }

  // ── A* ────────────────────────────────────────────────────────────────

  function astar(from: number, to: number): { visited: Int32Array; path: number[] } {
    const n = cols * rows
    const g = new Float64Array(n).fill(Infinity)
    const prev = new Int32Array(n).fill(-1)
    const done = new Uint8Array(n)
    const order: number[] = []
    const tr = Math.floor(to / cols)
    const tc = to % cols
    const h = (i: number) => Math.abs(Math.floor(i / cols) - tr) + Math.abs((i % cols) - tc)
    // Binary heap of [priority, cell] packed in two arrays.
    const pri: number[] = []
    const val: number[] = []
    const push = (p: number, v: number) => {
      let i = pri.length
      pri.push(p)
      val.push(v)
      while (i > 0) {
        const up = (i - 1) >> 1
        if (pri[up] <= pri[i]) break
        ;[pri[up], pri[i]] = [pri[i], pri[up]]
        ;[val[up], val[i]] = [val[i], val[up]]
        i = up
      }
    }
    const pop = () => {
      const top = val[0]
      const lp = pri.pop()!
      const lv = val.pop()!
      if (pri.length) {
        pri[0] = lp
        val[0] = lv
        let i = 0
        for (;;) {
          const l = 2 * i + 1
          const r = l + 1
          let m = i
          if (l < pri.length && pri[l] < pri[m]) m = l
          if (r < pri.length && pri[r] < pri[m]) m = r
          if (m === i) break
          ;[pri[m], pri[i]] = [pri[i], pri[m]]
          ;[val[m], val[i]] = [val[i], val[m]]
          i = m
        }
      }
      return top
    }

    g[from] = 0
    push(h(from), from)
    while (pri.length) {
      const cell = pop()
      if (done[cell]) continue
      done[cell] = 1
      order.push(cell)
      if (cell === to) break
      for (const next of [cell - cols, cell + 1, cell + cols, cell - 1]) {
        if (!open[next] || done[next]) continue
        const cost = g[cell] + 1
        if (cost >= g[next]) continue
        g[next] = cost
        prev[next] = cell
        // Tie-break towards the goal so the search looks purposeful.
        push(cost + h(next) * 1.001, next)
      }
    }
    const path: number[] = []
    if (done[to]) for (let at = to; at !== -1; at = prev[at]) path.push(at)
    return { visited: Int32Array.from(order), path }
  }

  function aim(cell: number, now: number): void {
    if (cell === goal || !open[cell]) return
    goal = cell
    const { visited, path } = astar(start, cell)
    previous = current
    if (previous) previous.startedAt = now - 10_000 // let it fade out
    current = { visited, path, startedAt: now, colour: colours[colourIndex++ % colours.length] }
    wake()
  }

  // ── drawing ───────────────────────────────────────────────────────────

  const EXPLORE = 520 // ms to reveal the explored cells
  const TRACE = 420 // ms to draw the route
  const FADE = 1400 // ms the explored cells stay visible

  function centre(i: number): [number, number] {
    return [(i % cols) * CELL + CELL / 2, Math.floor(i / cols) * CELL + CELL / 2]
  }

  function draw(now: number): boolean {
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Walls as faint dots — a map, not a cage.
    ctx.fillStyle = ink
    ctx.globalAlpha = 0.07
    for (let i = 0; i < open.length; i++) {
      if (open[i]) continue
      const [x, y] = centre(i)
      ctx.fillRect(x - 2, y - 2, 4, 4)
    }

    let busy = false
    for (const s of [previous, current]) {
      if (!s) continue
      const t = now - s.startedAt
      if (s === previous && t > 10_000 + 300) continue

      // Explored cells: appear in A*'s order, then fade.
      const shown = still ? s.visited.length : Math.min(s.visited.length, Math.floor((t / EXPLORE) * s.visited.length))
      const fade = still ? 0.06 : Math.max(0, 1 - (t - EXPLORE) / FADE)
      if (fade > 0 && s === current) {
        ctx.fillStyle = s.colour
        for (let k = 0; k < shown; k++) {
          const [x, y] = centre(s.visited[k])
          ctx.globalAlpha = 0.11 * fade
          ctx.fillRect(x - CELL / 2 + 2, y - CELL / 2 + 2, CELL - 4, CELL - 4)
        }
        busy = busy || fade > 0
      }

      // The route, traced from the start towards the cursor.
      const part = still ? 1 : Math.max(0, Math.min(1, (t - EXPLORE * 0.6) / TRACE))
      const alpha = s === previous ? Math.max(0, 1 - (t - 10_000) / 300) : 1
      if (part > 0 && s.path.length > 1 && alpha > 0) {
        const pts = s.path.slice().reverse()
        const upto = Math.max(1, Math.floor(part * (pts.length - 1)))
        ctx.globalAlpha = 0.85 * alpha
        ctx.strokeStyle = s.colour
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        for (let k = 0; k <= upto; k++) {
          const [x, y] = centre(pts[k])
          if (k === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        // A small head on the moving end.
        const [hx, hy] = centre(pts[upto])
        ctx.beginPath()
        ctx.arc(hx, hy, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = s.colour
        ctx.fill()
        busy = busy || part < 1 || alpha < 1
      }
    }

    // Start marker.
    const [sx, sy] = centre(start)
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = ink
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(sx, sy, 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
    return busy
  }

  function frame(now: number): void {
    raf = 0
    if (!visible) return
    if (draw(now)) raf = requestAnimationFrame(frame)
  }

  function wake(): void {
    if (!raf && visible) raf = requestAnimationFrame(frame)
  }

  // ── input and lifecycle ───────────────────────────────────────────────

  host.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect()
    lastPointer = performance.now()
    aim(nearestOpen(Math.floor((e.clientY - rect.top) / CELL), Math.floor((e.clientX - rect.left) / CELL)), lastPointer)
  })

  // A click moves the start: the next route begins where you clicked.
  host.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) return
    const rect = canvas.getBoundingClientRect()
    start = nearestOpen(Math.floor((e.clientY - rect.top) / CELL), Math.floor((e.clientX - rect.left) / CELL))
    const target = goal
    goal = -1
    if (target >= 0) aim(target, performance.now())
  })

  // Without a mouse (or when it rests) the goal wanders on its own.
  function wander(): void {
    if (visible && !document.hidden && performance.now() - lastPointer > 4000) {
      aim(nearestOpen(1 + Math.floor(Math.random() * (rows - 2)), Math.floor(cols * 0.35 + Math.random() * cols * 0.63)), performance.now())
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    wake()
  }).observe(host)

  let resizeTimer = 0
  new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      build()
      aim(nearestOpen(2, cols - 3), performance.now())
      wake()
    }, 120)
  }).observe(host)

  build()
  aim(nearestOpen(2, cols - 3), performance.now())
  if (!still) setInterval(wander, 3200)
  wake()
}
