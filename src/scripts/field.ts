/**
 * The hero background: a faint maze with one "snake" per project crawling
 * through it. Each snake picks a random spot, finds its way there with A*
 * (the explored cells flash briefly in its colour), crawls along the route
 * and sends out a ring when it arrives. The cursor works as a lamp: walls
 * near it show up a little brighter. Hovering a project in the colour strip
 * below makes that project's snake stand out.
 *
 * It only animates while the hero is on screen and the tab is visible; with
 * prefers-reduced-motion it draws one still frame and stops.
 */

const CELL = 22
const TAIL = 11 // cells of tail behind the head
/** Head positions kept per frame — about 1.6 s of movement at 60 fps. */
const TRAIL_POINTS = 96
const LAMP = 170 // px radius of the cursor light

interface Snake {
  colour: string
  route: number[] // start → goal
  at: number // position along the route, in cells (fractional)
  speed: number // cells per second
  trail: [number, number][] // recent head positions, newest last
  explored: Int32Array
  plannedAt: number
}

interface Ring {
  x: number
  y: number
  colour: string
  born: number
}

export interface Field {
  highlight(colour: string | null): void
}

export function startField(canvas: HTMLCanvasElement, colours: string[]): Field {
  const ctx = canvas.getContext('2d')!
  const host = canvas.parentElement!
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches

  let cols = 0
  let rows = 0
  let open = new Uint8Array(0)
  let corridors: number[] = []
  let snakes: Snake[] = []
  let rings: Ring[] = []
  let ink = '#24262b'
  let lamp: [number, number] | null = null
  let focus: string | null = null
  let visible = true
  let raf = 0
  let last = 0
  let cssW = 0
  let cssH = 0
  const wokeAt = performance.now()


  // Deterministic randomness for the maze, ordinary randomness for the snakes.
  let seed = 20261021
  const mazeRand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

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
    cssW = w
    cssH = h
    ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || ink

    cols = Math.max(9, Math.floor(w / CELL) | 1)
    rows = Math.max(9, Math.floor(h / CELL) | 1)
    open = new Uint8Array(cols * rows)
    seed = 20261021

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
      const n = next[Math.floor(mazeRand() * next.length)]
      open[(cell + n) / 2] = 1
      open[n] = 1
      stack.push(n)
    }
    // Knock out some walls so there are loops and A* has choices.
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const i = r * cols + c
        if (open[i] || mazeRand() > 0.16) continue
        if ((open[i - 1] && open[i + 1]) !== (open[i - cols] && open[i + cols])) open[i] = 1
      }
    }
    corridors = []
    for (let i = 0; i < open.length; i++) if (open[i]) corridors.push(i)

    const now = performance.now()
    rings = []
    snakes = colours.map((colour, k) => {
      const s: Snake = { colour, route: [], at: 0, speed: 6 + Math.random() * 4, trail: [], explored: new Int32Array(0), plannedAt: now }
      // Stagger the first plans so the snakes don't all "think" at once.
      plan(s, corridors[Math.floor(Math.random() * corridors.length)], now - 2000 + k * 160)
      if (still) {
        s.at = Math.min(s.route.length - 1, TAIL + 4)
        s.trail = s.route.slice(0, Math.floor(s.at) + 1).map(centre)
      }
      return s
    })
  }

  // ── A* ────────────────────────────────────────────────────────────────

  function astar(from: number, to: number): { route: number[]; explored: Int32Array } {
    const n = cols * rows
    const g = new Float64Array(n).fill(Infinity)
    const prev = new Int32Array(n).fill(-1)
    const done = new Uint8Array(n)
    const order: number[] = []
    const tr = Math.floor(to / cols)
    const tc = to % cols
    const h = (i: number) => Math.abs(Math.floor(i / cols) - tr) + Math.abs((i % cols) - tc)
    const pri: number[] = []
    const val: number[] = []
    const swap = (a: number, b: number) => {
      ;[pri[a], pri[b]] = [pri[b], pri[a]]
      ;[val[a], val[b]] = [val[b], val[a]]
    }
    const push = (p: number, v: number) => {
      let i = pri.push(p) - 1
      val.push(v)
      while (i > 0 && pri[(i - 1) >> 1] > pri[i]) {
        swap(i, (i - 1) >> 1)
        i = (i - 1) >> 1
      }
    }
    const pop = () => {
      const top = val[0]
      const lp = pri.pop()!
      const lv = val.pop()!
      if (pri.length) {
        pri[0] = lp
        val[0] = lv
        for (let i = 0; ; ) {
          const l = 2 * i + 1
          let m = i
          if (l < pri.length && pri[l] < pri[m]) m = l
          if (l + 1 < pri.length && pri[l + 1] < pri[m]) m = l + 1
          if (m === i) break
          swap(i, m)
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
        push(cost + h(next) * 1.001, next)
      }
    }
    const route: number[] = []
    if (done[to]) for (let at = to; at !== -1; at = prev[at]) route.push(at)
    return { route: route.reverse(), explored: Int32Array.from(order) }
  }

  function plan(s: Snake, from: number, now: number): void {
    // A goal far enough away that the trip is worth watching.
    let goal = from
    for (let tries = 0; tries < 20; tries++) {
      goal = corridors[Math.floor(Math.random() * corridors.length)]
      const d = Math.abs(Math.floor(goal / cols) - Math.floor(from / cols)) + Math.abs((goal % cols) - (from % cols))
      if (d > Math.min(cols, rows) * 0.6) break
    }
    const { route, explored } = astar(from, goal)
    s.route = route.length > 1 ? route : [from]
    s.explored = explored
    s.at = 0
    s.plannedAt = now
  }

  const centre = (i: number): [number, number] => [(i % cols) * CELL + CELL / 2, Math.floor(i / cols) * CELL + CELL / 2]

  function head(s: Snake): [number, number] {
    const i = Math.min(Math.floor(s.at), s.route.length - 1)
    const j = Math.min(i + 1, s.route.length - 1)
    const t = s.at - i
    const [ax, ay] = centre(s.route[i])
    const [bx, by] = centre(s.route[j])
    return [ax + (bx - ax) * t, ay + (by - ay) * t]
  }

  // ── simulation ────────────────────────────────────────────────────────

  const THINK = 380 // ms of "thinking" before setting off
  const FLASH = 1100 // ms the explored cells stay visible

  function step(now: number, dt: number): void {
    for (const s of snakes) {
      if (now - s.plannedAt < THINK) continue
      s.at += (s.speed * dt) / 1000
      s.trail.push(head(s))
      if (s.trail.length > TRAIL_POINTS) s.trail.shift()
      if (s.at >= s.route.length - 1) {
        const [x, y] = centre(s.route[s.route.length - 1])
        rings.push({ x, y, colour: s.colour, born: now })
        plan(s, s.route[s.route.length - 1], now)
      }
    }
    rings = rings.filter((r) => now - r.born < 1400)

  }

  // ── drawing ───────────────────────────────────────────────────────────

  function draw(now: number): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Walls: faint dots, brighter in the cursor's light. On first load they
    // wake up in a wave spreading from the middle of the header.
    const woke = still ? Infinity : now - wokeAt
    const cx = cssW * 0.5
    const cy = cssH * 0.55
    ctx.fillStyle = ink
    for (let i = 0; i < open.length; i++) {
      if (open[i]) continue
      const [x, y] = centre(i)
      const wave = woke > 2600 ? 1 : Math.max(0, Math.min(1, (woke - Math.hypot(x - cx, y - cy) * 1.1) / 320))
      if (wave === 0) continue
      let a = 0.06 + 0.3 * (wave < 1 ? Math.sin(wave * Math.PI) : 0)
      if (lamp) {
        const d = Math.hypot(x - lamp[0], y - lamp[1])
        if (d < LAMP) a += 0.22 * (1 - d / LAMP) ** 2
      }
      ctx.globalAlpha = a * wave
      const size = a > 0.1 ? 5 : 4
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    }

    for (const s of snakes) {
      const dim = focus && focus !== s.colour ? 0.25 : 1
      const bold = focus === s.colour ? 1.8 : 1

      // The cells A* looked at while planning — a quick flash, then gone.
      const t = now - s.plannedAt
      if (!still && t < FLASH) {
        const shown = Math.min(s.explored.length, Math.floor((t / THINK) * s.explored.length))
        ctx.fillStyle = s.colour
        ctx.globalAlpha = 0.35 * (1 - t / FLASH) * dim
        ctx.beginPath()
        for (let k = 0; k < shown; k++) {
          const [x, y] = centre(s.explored[k])
          ctx.moveTo(x + 2.5, y)
          ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        }
        ctx.fill()
      }

      // Tail: follows the maze's right angles, thinning and fading towards the end.
      const pts = s.trail
      ctx.lineJoin = 'miter'
      ctx.strokeStyle = s.colour
      // A few solid pieces, each a little bolder than the last: no beads
      // where short segments would overlap.
      const n = pts.length
      const PIECES = 8
      for (let p = 0; p < PIECES; p++) {
        const a = Math.floor((p * (n - 1)) / PIECES)
        const b = Math.floor(((p + 1) * (n - 1)) / PIECES)
        if (b <= a) continue
        const f = (p + 1) / PIECES
        ctx.globalAlpha = 0.9 * f * f * dim
        ctx.lineWidth = (0.8 + 3.2 * f) * bold
        ctx.lineCap = p === PIECES - 1 ? 'round' : 'butt'
        ctx.beginPath()
        ctx.moveTo(pts[a][0], pts[a][1])
        for (let k = a + 1; k <= b; k++) ctx.lineTo(pts[k][0], pts[k][1])
        ctx.stroke()
      }
      const [hx, hy] = pts.length ? pts[pts.length - 1] : head(s)
      ctx.globalAlpha = dim
      ctx.fillStyle = s.colour
      ctx.beginPath()
      ctx.arc(hx, hy, 4.2 * bold, 0, Math.PI * 2)
      ctx.fill()
    }

    // Arrival rings.
    for (const r of rings) {
      const t = (now - r.born) / 1400
      ctx.globalAlpha = 0.55 * (1 - t) * (focus && focus !== r.colour ? 0.25 : 1)
      ctx.strokeStyle = r.colour
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(r.x, r.y, 4 + 46 * (1 - (1 - t) ** 3), 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  function frame(now: number): void {
    raf = 0
    if (!visible || document.hidden) return
    const dt = Math.min(64, now - (last || now))
    last = now
    step(now, dt)
    draw(now)
    raf = requestAnimationFrame(frame)
  }

  function wake(): void {
    if (still) {
      draw(performance.now())
      return
    }
    if (!raf && visible && !document.hidden) {
      last = 0
      raf = requestAnimationFrame(frame)
    }
  }

  // ── input and lifecycle ───────────────────────────────────────────────

  host.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect()
    lamp = [e.clientX - rect.left, e.clientY - rect.top]
    if (still) wake()
  })
  host.addEventListener('pointerleave', () => {
    lamp = null
    if (still) wake()
  })

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    wake()
  }).observe(host)
  document.addEventListener('visibilitychange', wake)

  let resizeTimer = 0
  new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      build()
      wake()
    }, 120)
  }).observe(host)

  build()
  wake()

  return {
    highlight(colour) {
      focus = colour
      if (still) wake()
    },
  }
}
