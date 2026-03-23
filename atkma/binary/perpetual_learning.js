/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  PERPETUAL LEARNING PATH PROCESS  —  JavaScript Engine                  ║
 * ║  QUANTUM CUBE Synthesis Context · ION Domain Layer                       ║
 * ║  Architecture: KnowledgeNode → KnowledgeGraph → MasteryTracker           ║
 * ║               → PerpetualLearningEngine → QuantumCubeSync                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Run:  node perpetual_learning.js
 * Node: >= 14.x  (uses EventEmitter, no external deps)
 */

'use strict';

const EventEmitter = require('events');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const MASTERY_THRESHOLD   = 0.80;   // 80% = node considered mastered
const DECAY_LAMBDA        = 0.00040;// entropy decay rate per minute (72-hr half-life ≈ 0.000161/min; tuned faster for demo)
const URGENCY_SCALE       = 1.5;    // weight for unmastered urgency
const DISCOVERY_BONUS     = 2.0;    // multiplier for never-studied nodes
const STUDY_GAIN_BASE     = 0.18;   // base mastery gain per study cycle
const MAX_CYCLES          = 8;      // 0 = perpetual

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeNode
// ─────────────────────────────────────────────────────────────────────────────
class KnowledgeNode {
  /**
   * @param {string}   id           – unique identifier e.g. "CSID_9700"
   * @param {string}   label        – human name e.g. "Calcium Carbonate"
   * @param {number}   phi          – complexity weight φ ∈ (0, ∞)
   * @param {string[]} prerequisites – IDs that must be mastered first
   * @param {string}   domain       – ION domain tag
   */
  constructor(id, label, phi, prerequisites = [], domain = 'GENERAL') {
    this.id            = id;
    this.label         = label;
    this.phi           = phi;
    this.prerequisites = prerequisites;
    this.domain        = domain;
    this.metadata      = {};       // extensible payload
  }
  toString() {
    return `[${this.id}] "${this.label}" φ=${this.phi} deps=[${this.prerequisites.join(',')}]`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeGraph  — DAG with Kahn's topological sort
// ─────────────────────────────────────────────────────────────────────────────
class KnowledgeGraph {
  constructor() {
    this._nodes = new Map();  // id → KnowledgeNode
  }

  addNode(node) {
    if (!(node instanceof KnowledgeNode)) throw new TypeError('Expected KnowledgeNode');
    this._nodes.set(node.id, node);
    return this;
  }

  getNode(id) { return this._nodes.get(id) || null; }
  allNodes()  { return Array.from(this._nodes.values()); }

  /**
   * Kahn's algorithm — returns topologically sorted node IDs.
   * Throws if a cycle is detected (invalid curriculum).
   */
  topologicalSort() {
    const inDegree = new Map();
    const adj      = new Map();

    for (const node of this._nodes.values()) {
      if (!inDegree.has(node.id)) inDegree.set(node.id, 0);
      if (!adj.has(node.id))      adj.set(node.id, []);
      for (const pre of node.prerequisites) {
        if (!adj.has(pre)) adj.set(pre, []);
        adj.get(pre).push(node.id);
        inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
      }
    }
    const queue  = [];
    const sorted = [];

    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }

    while (queue.length > 0) {
      const curr = queue.shift();
      sorted.push(curr);
      for (const neighbor of (adj.get(curr) || [])) {
        const newDeg = inDegree.get(neighbor) - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) queue.push(neighbor);
      }
    }

    if (sorted.length !== this._nodes.size) {
      throw new Error('KnowledgeGraph: cycle detected — invalid curriculum DAG');
    }
    return sorted;
  }

  /**
   * Returns nodes whose prerequisites are all mastered (or have no prereqs).
   * @param {Map<string,number>} masteryMap  id → mastery score [0,1]
   */
  availableNodes(masteryMap) {
    return this.allNodes().filter(node =>
      node.prerequisites.every(pre => {
        const m = masteryMap.get(pre) || 0;
        return m >= MASTERY_THRESHOLD;
      })
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MasteryTracker  — stores scores with exponential entropy decay
// mastery(t) = score × e^(−λ · Δt)   where Δt is minutes since last study
// ─────────────────────────────────────────────────────────────────────────────
class MasteryTracker {
  constructor(lambda = DECAY_LAMBDA) {
    this._lambda    = lambda;
    this._scores    = new Map();   // id → { score, lastStudied: Date }
    this._studyCount = new Map();  // id → number of times studied
  }

  /**
   * Record a study event, blending new gain into current (decayed) score.
   */
  recordStudy(id, gain) {
    const current = this.getMastery(id);      // already applies decay
    const updated = Math.min(1.0, current + gain);
    this._scores.set(id, { score: updated, lastStudied: new Date() });
    this._studyCount.set(id, (this._studyCount.get(id) || 0) + 1);
    return updated;
  }
  /**
   * Current mastery with entropy decay applied.
   */
  getMastery(id) {
    const entry = this._scores.get(id);
    if (!entry) return 0;
    const deltaMinutes = (Date.now() - entry.lastStudied.getTime()) / 60000;
    return entry.score * Math.exp(-this._lambda * deltaMinutes);
  }

  isMastered(id) { return this.getMastery(id) >= MASTERY_THRESHOLD; }

  studyCount(id)  { return this._studyCount.get(id) || 0; }

  /**
   * Snapshot of all current mastery values (decay applied).
   */
  snapshot() {
    const map = new Map();
    for (const id of this._scores.keys()) {
      map.set(id, this.getMastery(id));
    }
    return map;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PerpetualLearningEngine  — core loop
// ─────────────────────────────────────────────────────────────────────────────
class PerpetualLearningEngine extends EventEmitter {
  /**
   * @param {KnowledgeGraph}  graph
   * @param {MasteryTracker}  tracker
   * @param {object}          opts
   * @param {number}          opts.maxCycles  0 = truly perpetual
   * @param {number}          opts.tickMs     milliseconds between cycles
   */
  constructor(graph, tracker, opts = {}) {
    super();
    this._graph    = graph;
    this._tracker  = tracker;
    this._maxCycles = opts.maxCycles ?? MAX_CYCLES;
    this._tickMs    = opts.tickMs   ?? 600;
    this._cycle     = 0;
    this._running   = false;
    this._timer     = null;
    this._discoveryQueue = [];  // nodes pending unlock
  }

  /** Enqueue a node for dynamic curriculum expansion. */
  enqueue(node) {
    if (!this._graph.getNode(node.id)) {
      this._graph.addNode(node);
      this._discoveryQueue.push(node.id);
      this.emit('nodeEnqueued', node);
    }
  }

  start() {
    if (this._running) return;
    this._running = true;
    this.emit('start', { maxCycles: this._maxCycles });
    this._tick();
  }

  stop() {
    this._running = false;
    if (this._timer) clearTimeout(this._timer);
    this.emit('stop', { cyclesCompleted: this._cycle });
  }

  // ── Core tick ────────────────────────────────────────────────────────────
  _tick() {
    if (!this._running) return;
    if (this._maxCycles > 0 && this._cycle >= this._maxCycles) {
      this.stop();
      return;
    }

    this._cycle++;
    const masterySnap = this._tracker.snapshot();

    // 1. Determine available nodes
    const available = this._graph.availableNodes(masterySnap);
    if (available.length === 0) {
      this.emit('idle', { cycle: this._cycle, reason: 'no_available_nodes' });
      this._scheduleNext();
      return;
    }

    // 2. Priority queue: urgency × discoveryBonus / φ
    const scored = available.map(node => {
      const m        = masterySnap.get(node.id) || 0;
      const urgency  = (1 - m) * URGENCY_SCALE;
      const discovery= this._tracker.studyCount(node.id) === 0 ? DISCOVERY_BONUS : 1.0;
      const priority = (urgency * discovery) / node.phi;
      return { node, priority, mastery: m };
    });

    scored.sort((a, b) => b.priority - a.priority);
    const { node: target, mastery: currentMastery } = scored[0];

    // 3. Study the top node
    const gain      = STUDY_GAIN_BASE / target.phi;  // harder nodes gain less per cycle
    const newMastery= this._tracker.recordStudy(target.id, gain);
    const mastered  = newMastery >= MASTERY_THRESHOLD;

    const cycleResult = {
      cycle    : this._cycle,
      nodeId   : target.id,
      label    : target.label,
      domain   : target.domain,
      phi      : target.phi,
      before   : +currentMastery.toFixed(4),
      after    : +newMastery.toFixed(4),
      mastered,
      queue    : scored.map(s => ({
        id      : s.node.id,
        label   : s.node.label,
        priority: +s.priority.toFixed(4),
        mastery : +(masterySnap.get(s.node.id) || 0).toFixed(4),
      })),
    };

    this.emit('cycle', cycleResult);
    if (mastered) this.emit('nodeMastered', { id: target.id, label: target.label, mastery: newMastery });

    // 4. Dynamic graph expansion — check discovery queue
    this._checkDiscoveryQueue(this._tracker.snapshot());

    this._scheduleNext();
  }

  _checkDiscoveryQueue(masterySnap) {
    this._discoveryQueue = this._discoveryQueue.filter(id => {
      const node = this._graph.getNode(id);
      if (!node) return false;
      const allPresMet = node.prerequisites.every(
        pre => (masterySnap.get(pre) || 0) >= MASTERY_THRESHOLD
      );
      if (allPresMet) {
        this.emit('nodeUnlocked', node);
        return false;  // remove from queue — node is now live in graph
      }
      return true;
    });
  }
  _scheduleNext() {
    this._timer = setTimeout(() => this._tick(), this._tickMs);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// QuantumCubeSync  — ION Domain orchestrator + event wiring
// ─────────────────────────────────────────────────────────────────────────────
class QuantumCubeSync {
  constructor(engine) {
    this._engine  = engine;
    this._ionLog  = [];      // ION domain event stream
    this._cubeState = {
      activeNode : null,
      cycleCount : 0,
      masteredIds: new Set(),
      unlockedIds: new Set(),
    };
    this._wireEvents();
  }

  _wireEvents() {
    const e = this._engine;

    e.on('start', ({ maxCycles }) => {
      this._log('ION_BOOT', `QuantumCube engine start — maxCycles=${maxCycles || '∞'}`);
    });

    e.on('cycle', (r) => {
      this._cubeState.activeNode = r.nodeId;
      this._cubeState.cycleCount = r.cycle;
      const bar = this._masteryBar(r.after);
      console.log(
        `  [C${String(r.cycle).padStart(2,'0')}] ` +
        `${r.label.padEnd(24)} φ=${r.phi}  ` +
        `${bar} ${(r.after * 100).toFixed(1)}%` +
        (r.mastered ? '  ✓ MASTERED' : '')
      );
      this._log('CYCLE', `${r.nodeId} mastery ${r.before}→${r.after}`);
    });

    e.on('nodeMastered', ({ id, label, mastery }) => {
      this._cubeState.masteredIds.add(id);
      console.log(`  ◈ NODE MASTERED: "${label}" @ ${(mastery*100).toFixed(1)}%`);
      this._log('MASTERED', `${id} — ${label}`);
    });

    e.on('nodeUnlocked', (node) => {
      this._cubeState.unlockedIds.add(node.id);
      console.log(`  ⬡ UNLOCKED: "${node.label}" (prereqs satisfied)`);
      this._log('UNLOCKED', `${node.id} — ${node.label}`);
    });

    e.on('nodeEnqueued', (node) => {
      console.log(`  ↳ QUEUED: "${node.label}" awaiting prerequisites`);
      this._log('QUEUED', node.id);
    });

    e.on('idle', ({ cycle, reason }) => {
      console.log(`  ~ IDLE cycle ${cycle}: ${reason}`);
    });

    e.on('stop', ({ cyclesCompleted }) => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  ENGINE STOP — ${cyclesCompleted} cycles completed`);
      console.log(`  Mastered: [${[...this._cubeState.masteredIds].join(', ')}]`);
      console.log(`  Unlocked: [${[...this._cubeState.unlockedIds].join(', ')}]`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      this._log('STOP', `cycles=${cyclesCompleted}`);
    });
  }

  _log(type, msg) {
    this._ionLog.push({ ts: new Date().toISOString(), type, msg });
  }

  _masteryBar(val, width = 16) {
    const filled = Math.round(val * width);
    return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
  }

  exportLog() { return [...this._ionLog]; }
  cubeState() { return { ...this._cubeState, masteredIds: [...this._cubeState.masteredIds] }; }
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM — Calcium Carbonate / β-Keratin ION domain
// ─────────────────────────────────────────────────────────────────────────────
function buildCurriculum() {
  const graph = new KnowledgeGraph();

  // Layer 0 — foundational
  graph.addNode(new KnowledgeNode('CHEM_ATOMIC',   'Atomic Structure',         1.0, [],                          'CHEMISTRY'));
  graph.addNode(new KnowledgeNode('CHEM_BOND',     'Chemical Bonding',         1.2, ['CHEM_ATOMIC'],             'CHEMISTRY'));
  graph.addNode(new KnowledgeNode('BIO_CELL',      'Cell Biology Fundamentals',1.0, [],                          'BIOLOGY'));

  // Layer 1 — intermediate
  graph.addNode(new KnowledgeNode('CSID_9700',     'Calcium Carbonate',        1.8, ['CHEM_BOND'],               'MINERALOGY'));
  graph.addNode(new KnowledgeNode('BIO_PROT',      'Protein Folding Basics',   2.0, ['BIO_CELL', 'CHEM_BOND'],   'BIOCHEMISTRY'));
  graph.addNode(new KnowledgeNode('BIO_BONE',      'Bone Matrix Structure',    2.2, ['CSID_9700', 'BIO_PROT'],   'ANATOMY'));

  // Layer 2 — advanced (starts in discovery queue → unlocks after BIO_BONE)
  const betaKeratin = new KnowledgeNode('BIO_BKER', 'β-Keratin',               2.8, ['BIO_BONE'],                'STRUCTURAL_BIO');
  // will be enqueued dynamically

  return { graph, betaKeratin };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
(function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  PERPETUAL LEARNING PATH PROCESS — JavaScript Engine     ║');
  console.log('║  QUANTUM CUBE · ION Domain · Entropy Decay Active        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const { graph, betaKeratin } = buildCurriculum();

  // Validate DAG before starting
  const sorted = graph.topologicalSort();
  console.log(`  DAG validated — topological order: ${sorted.join(' → ')}\n`);

  const tracker = new MasteryTracker(DECAY_LAMBDA);
  const engine  = new PerpetualLearningEngine(graph, tracker, {
    maxCycles: MAX_CYCLES,
    tickMs   : 400,
  });
  const cube = new QuantumCubeSync(engine);

  // Dynamically enqueue β-Keratin — will unlock once BIO_BONE mastered
  engine.enqueue(betaKeratin);

  console.log('  Starting engine...\n');
  engine.start();

  // After engine finishes, print ION log summary
  engine.on('stop', () => {
    setTimeout(() => {
      const log = cube.exportLog();
      console.log(`  ION Event Log (${log.length} entries):`);
      log.forEach(e => console.log(`    ${e.ts.split('T')[1].split('.')[0]} [${e.type.padEnd(8)}] ${e.msg}`));
    }, 100);
  });
})();
module.exports = { KnowledgeNode, KnowledgeGraph, MasteryTracker, PerpetualLearningEngine, QuantumCubeSync };
