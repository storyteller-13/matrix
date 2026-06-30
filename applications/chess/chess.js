/**
 * Chess.com Daily Panel – fetches daily puzzle via API and renders board (no iframe)
 */
const PIECE_SYMBOLS = {
  K: '\u2654', Q: '\u2655', R: '\u2656', B: '\u2657', N: '\u2658', P: '\u2659',
  k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F',
};

class ChessPanel {
  constructor() {
    this.boxId = 'chess-box';
    this.apiUrl = window.Env?.isLocalhost() ? 'https://api.chess.com/pub/puzzle' : '/api/chess';
    this.els = {};
    this.init();
  }

  init() {
    this.els.box = document.getElementById(this.boxId);
    this.els.closeBtn = document.getElementById('chess-box-close');
    this.els.loading = document.getElementById('chess-loading');
    this.els.content = document.getElementById('chess-puzzle-content');
    this.els.error = document.getElementById('chess-error');
    this.els.wrap = document.getElementById('chess-board-wrap');

    if (this.els.closeBtn) this.els.closeBtn.addEventListener('click', () => this.hideBox());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.els.box && window.getComputedStyle(this.els.box).display !== 'none') this.hideBox();
    });

    this.loadPuzzle();
  }

  /** Parse FEN piece placement (first field) into 8x8 array; returns board[rank][file] with rank 0 = 8th rank. */
  fenToBoard(fen) {
    const placement = (fen || '').split(' ')[0];
    if (!placement) return null;
    const rows = placement.split('/');
    if (rows.length !== 8) return null;
    const board = [];
    for (let r = 0; r < 8; r++) {
      const row = [];
      for (const ch of rows[r]) {
        if (/[1-8]/.test(ch)) {
          for (let i = 0; i < parseInt(ch, 10); i++) row.push(null);
        } else if (/[KQRBNPkqrbnp]/.test(ch)) {
          row.push(ch);
        }
      }
      board.push(row);
    }
    return board;
  }

  renderBoard(container, fen) {
    const board = this.fenToBoard(fen);
    if (!board) return;
    container.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const isLight = (r + f) % 2 === 0;
        const cell = document.createElement('div');
        cell.className = 'cell ' + (isLight ? 'light' : 'dark');
        const piece = board[r][f];
        if (piece) {
          cell.textContent = PIECE_SYMBOLS[piece] || piece;
        }
        container.appendChild(cell);
      }
    }
  }

  setLoading(loading) {
    const { loading: el, content, error: err } = this.els;
    if (el) el.style.display = loading ? 'block' : 'none';
    if (content) content.style.display = loading ? 'none' : 'flex';
    if (err) err.style.display = 'none';
  }

  extractFen(data) {
    if (!data) return null;
    if (data.fen) return data.fen;
    if (data.puzzle?.fen) return data.puzzle.fen;
    if (typeof data === 'string' && /^[rnbqkpRNBQKP1-8/\s]+/.test(data)) return data.split(/\s/)[0];
    const pgnMatch = data.pgn?.match(/\bFEN\s+"([^"]+)"/);
    return pgnMatch ? pgnMatch[1] : null;
  }

  setError() {
    const { loading: el, content, error: err } = this.els;
    if (el) el.style.display = 'none';
    if (content) content.style.display = 'none';
    if (err) err.style.display = 'block';
  }

  async loadPuzzle() {
    const { wrap, content } = this.els;
    if (!wrap || !content) return;

    this.setLoading(true);
    try {
      const data = await this.fetchPuzzle(this.apiUrl);
      const fen = this.extractFen(data);
      if (fen) {
        this.renderBoard(wrap, fen);
        this.setLoading(false);
        return;
      }
      throw new Error('No FEN in response');
    } catch {
      try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.chess.com/pub/puzzle');
        const data = await this.fetchPuzzle(proxyUrl);
        const fen = this.extractFen(data);
        if (fen) {
          this.renderBoard(wrap, fen);
          this.setLoading(false);
          return;
        }
      } catch (_) {}
      this.setError();
    }
  }

  async fetchPuzzle(url) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  }

  toggleVisibility() {
    const box = this.els.box;
    if (!box) return;
    const visible = box.style.display !== 'none' && window.getComputedStyle(box).display !== 'none';
    visible ? this.hideBox() : this.showBox();
  }

  showBox() {
    const box = this.els.box;
    if (!box) return;
    box.style.display = 'block';
    box.style.opacity = '0';
    box.style.transform = 'translateX(-50%) translateY(-10px) scale(0.95)';
    void box.offsetHeight;
    requestAnimationFrame(() => {
      box.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      box.style.opacity = '1';
      box.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    });
  }

  hideBox() {
    const box = this.els.box;
    if (!box) return;
    box.style.opacity = '0';
    box.style.transform = 'translateX(-50%) translateY(-10px) scale(0.95)';
    setTimeout(() => { box.style.display = 'none'; }, 400);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.ChessPanel = new ChessPanel(); });
} else {
  window.ChessPanel = new ChessPanel();
}

window.openChessWindow = () => {
  if (window.ChessPanel) window.ChessPanel.toggleVisibility();
};
