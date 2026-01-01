
import React, { useState, useEffect, useCallback } from 'react';
import { 
  GameScreen, 
  GameConfig, 
  WordSourceType, 
  PlayerRole, 
  GameState 
} from './types';
import { PREDEFINED_CATEGORIES } from './constants';
import { fetchAiWords } from './services/geminiService';
import { 
  Users, 
  Skull, 
  Play, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Settings, 
  Sparkles, 
  FileText,
  Home,
  AlertTriangle
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    screen: GameScreen.HOME,
    config: {
      playerCount: 4,
      impostorCount: 1,
      wordSource: WordSourceType.PREDEFINED,
      selectedCategory: "Lugares"
    },
    players: [],
    currentWord: "",
    currentPlayerIndex: 0,
    revealState: 'WAITING_FOR_PLAYER'
  });

  const [customWords, setCustomWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('impostor_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(prev => ({ ...prev, config: { ...prev.config, ...parsed } }));
      } catch (e) {}
    }
  }, []);

  const saveConfig = (config: GameConfig) => {
    localStorage.setItem('impostor_config', JSON.stringify(config));
  };

  const startGame = async () => {
    setLoading(true);
    let words: string[] = [];
    
    if (gameState.config.wordSource === WordSourceType.PREDEFINED) {
      words = PREDEFINED_CATEGORIES[gameState.config.selectedCategory as keyof typeof PREDEFINED_CATEGORIES] || [];
    } else if (gameState.config.wordSource === WordSourceType.AI_CELEBRITY) {
      words = await fetchAiWords('CELEBRITIES');
    } else {
      words = customWords;
    }

    if (words.length === 0) {
      alert("No hay palabras disponibles para jugar.");
      setLoading(false);
      return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    // Assign roles
    const playerIndices = Array.from({ length: gameState.config.playerCount }, (_, i) => i);
    const shuffled = [...playerIndices].sort(() => Math.random() - 0.5);
    const impostorIndices = shuffled.slice(0, gameState.config.impostorCount);

    const players: PlayerRole[] = playerIndices.map(id => ({
      id,
      role: impostorIndices.includes(id) ? 'IMPOSTOR' : 'CITIZEN',
      secretWord: impostorIndices.includes(id) ? 'IMPOSTOR' : randomWord
    }));

    setGameState(prev => ({
      ...prev,
      players,
      currentWord: randomWord,
      currentPlayerIndex: 0,
      revealState: 'WAITING_FOR_PLAYER',
      screen: GameScreen.REVEAL
    }));
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      setCustomWords(lines);
      setGameState(prev => ({ ...prev, config: { ...prev.config, wordSource: WordSourceType.CUSTOM_FILE } }));
    };
    reader.readAsText(file);
  };

  // Rendering logic
  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade">
      <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
        <Skull size={48} className="text-white" />
      </div>
      <h1 className="text-5xl font-extrabold mb-2 tracking-tighter">IMPOSTOR</h1>
      <p className="text-slate-400 text-center mb-12 max-w-xs">
        Encuentra al espía antes de que descubra vuestro secreto.
      </p>
      
      <button 
        onClick={() => setGameState(prev => ({ ...prev, screen: GameScreen.SETUP }))}
        className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
      >
        <Play size={20} /> NUEVA PARTIDA
      </button>

      <div className="mt-8 flex gap-4">
        <div className="flex flex-col items-center p-4 glass rounded-2xl border border-slate-700/50">
          <span className="text-cyan-400 font-bold text-xl">{gameState.config.playerCount}</span>
          <span className="text-xs text-slate-500 uppercase">Jugadores</span>
        </div>
        <div className="flex flex-col items-center p-4 glass rounded-2xl border border-slate-700/50">
          <span className="text-indigo-400 font-bold text-xl">{gameState.config.impostorCount}</span>
          <span className="text-xs text-slate-500 uppercase">Impostores</span>
        </div>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="flex flex-col min-h-screen p-6 animate-fade">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setGameState(prev => ({ ...prev, screen: GameScreen.HOME }))} className="p-2 glass rounded-xl text-slate-400">
          <Home size={24} />
        </button>
        <h2 className="text-2xl font-bold">Configuración</h2>
      </div>

      <div className="space-y-8 flex-1">
        <section>
          <label className="flex items-center gap-2 text-slate-400 mb-4 text-sm font-semibold uppercase tracking-wider">
            <Users size={16} /> Número de Jugadores
          </label>
          <div className="flex items-center justify-between glass p-2 rounded-2xl">
            <button 
              onClick={() => setGameState(prev => ({ ...prev, config: { ...prev.config, playerCount: Math.max(3, prev.config.playerCount - 1) } }))}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-2xl font-bold"
            > - </button>
            <span className="text-3xl font-bold">{gameState.config.playerCount}</span>
            <button 
              onClick={() => setGameState(prev => ({ ...prev, config: { ...prev.config, playerCount: Math.min(12, prev.config.playerCount + 1) } }))}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-2xl font-bold"
            > + </button>
          </div>
        </section>

        <section>
          <label className="flex items-center gap-2 text-slate-400 mb-4 text-sm font-semibold uppercase tracking-wider">
            <Skull size={16} /> Número de Impostores
          </label>
          <div className="flex items-center justify-between glass p-2 rounded-2xl">
            <button 
              onClick={() => setGameState(prev => ({ ...prev, config: { ...prev.config, impostorCount: Math.max(1, prev.config.impostorCount - 1) } }))}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-2xl font-bold"
            > - </button>
            <span className="text-3xl font-bold text-indigo-400">{gameState.config.impostorCount}</span>
            <button 
              onClick={() => setGameState(prev => ({ ...prev, config: { ...prev.config, impostorCount: Math.min(Math.floor(gameState.config.playerCount / 2), prev.config.impostorCount + 1) } }))}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-2xl font-bold"
            > + </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Recomendado: 1 impostor cada 4-5 jugadores.</p>
        </section>

        <section>
          <label className="flex items-center gap-2 text-slate-400 mb-4 text-sm font-semibold uppercase tracking-wider">
            <Sparkles size={16} /> Fuente de Palabras
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: WordSourceType.PREDEFINED, label: 'Categorías Locales', icon: <Play size={18} /> },
              { id: WordSourceType.AI_CELEBRITY, label: 'Celebridades (IA)', icon: <Sparkles size={18} /> },
              { id: WordSourceType.CUSTOM_FILE, label: 'Cargar Archivo .txt', icon: <FileText size={18} /> },
            ].map(source => (
              <button
                key={source.id}
                onClick={() => setGameState(prev => ({ ...prev, config: { ...prev.config, wordSource: source.id } }))}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  gameState.config.wordSource === source.id 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                {source.icon}
                <span className="font-semibold">{source.label}</span>
                {gameState.config.wordSource === source.id && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />}
              </button>
            ))}
          </div>
          
          {gameState.config.wordSource === WordSourceType.CUSTOM_FILE && (
            <div className="mt-4 p-4 glass rounded-2xl border border-dashed border-slate-600">
               <input 
                type="file" 
                accept=".txt" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="file-upload" 
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <FileText className="text-slate-500" />
                <span className="text-sm text-slate-400">
                  {customWords.length > 0 ? `${customWords.length} palabras cargadas` : 'Pulsa para elegir archivo .txt'}
                </span>
              </label>
            </div>
          )}

          {gameState.config.wordSource === WordSourceType.PREDEFINED && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.keys(PREDEFINED_CATEGORIES).map(cat => (
                <button
                  key={cat}
                  onClick={() => setGameState(prev => ({ ...prev, config: { ...prev.config, selectedCategory: cat } }))}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    gameState.config.selectedCategory === cat ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <button 
        disabled={loading || (gameState.config.wordSource === WordSourceType.CUSTOM_FILE && customWords.length === 0)}
        onClick={() => {
          saveConfig(gameState.config);
          startGame();
        }}
        className="mt-12 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
        {loading ? 'GENERANDO ROLES...' : 'COMENZAR'}
      </button>
    </div>
  );

  const renderReveal = () => {
    const player = gameState.players[gameState.currentPlayerIndex];
    if (!player) return null;

    return (
      <div className="flex flex-col min-h-screen p-6 animate-fade">
        <div className="mb-8 text-center">
          <h2 className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-1">Paso y Juego</h2>
          <p className="text-2xl font-bold">Jugador {player.id + 1}</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {gameState.revealState === 'WAITING_FOR_PLAYER' && (
            <div className="text-center animate-fade">
              <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users size={48} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">¡Tú turno!</h3>
              <p className="text-slate-400 mb-8 max-w-[250px]">Entrega el dispositivo al Jugador {player.id + 1}. No dejes que nadie vea la pantalla.</p>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, revealState: 'READY_TO_SEE' }))}
                className="px-8 py-4 rounded-2xl bg-slate-800 font-bold border border-slate-700"
              >
                SOY EL JUGADOR {player.id + 1}
              </button>
            </div>
          )}

          {gameState.revealState === 'READY_TO_SEE' && (
            <div className="text-center animate-fade">
              <div className="w-48 h-48 bg-indigo-600/20 rounded-3xl border-2 border-dashed border-indigo-500 flex items-center justify-center mb-8 mx-auto">
                <EyeOff size={64} className="text-indigo-500 opacity-50" />
              </div>
              <p className="text-slate-400 mb-6">Pulsa para ver tu palabra secreta</p>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, revealState: 'VIEWING' }))}
                className="w-full max-w-xs py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                REVELAR ROL
              </button>
            </div>
          )}

          {gameState.revealState === 'VIEWING' && (
            <div className="text-center animate-fade">
              <div className={`p-8 rounded-3xl mb-8 ${player.role === 'IMPOSTOR' ? 'bg-red-500/10 border-2 border-red-500/50' : 'bg-green-500/10 border-2 border-green-500/50'}`}>
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-widest">
                  {player.role === 'IMPOSTOR' ? 'TU ERES EL' : 'TU PALABRA ES'}
                </h4>
                <div className={`text-4xl font-extrabold tracking-tight ${player.role === 'IMPOSTOR' ? 'text-red-500' : 'text-cyan-400'}`}>
                  {player.secretWord.toUpperCase()}
                </div>
              </div>
              {player.role === 'IMPOSTOR' ? (
                <div className="flex items-start gap-3 text-left p-4 glass rounded-2xl mb-8">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <p className="text-sm text-slate-300">Intenta descubrir de qué hablan los demás sin que se den cuenta de que no lo sabes.</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-left p-4 glass rounded-2xl mb-8">
                  <Eye className="text-cyan-500 shrink-0" size={20} />
                  <p className="text-sm text-slate-300">Describe esta palabra sin decirla directamente. Si el impostor la adivina, gana.</p>
                </div>
              )}
              <button 
                onClick={() => {
                  if (gameState.currentPlayerIndex < gameState.players.length - 1) {
                    setGameState(prev => ({ 
                      ...prev, 
                      currentPlayerIndex: prev.currentPlayerIndex + 1,
                      revealState: 'WAITING_FOR_PLAYER'
                    }));
                  } else {
                    setGameState(prev => ({ ...prev, screen: GameScreen.DEBATE }));
                  }
                }}
                className="w-full max-w-xs py-4 rounded-2xl bg-slate-100 text-slate-900 font-bold text-lg"
              >
                ENTENDIDO
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-1">
          {gameState.players.map((p, idx) => (
            <div 
              key={idx} 
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === gameState.currentPlayerIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
              }`} 
            />
          ))}
        </div>
      </div>
    );
  };

  const renderDebate = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-fade">
      <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-red-500/20">
        <Users size={48} className="text-white" />
      </div>
      <h2 className="text-4xl font-black mb-4 tracking-tight">¡DEBATE!</h2>
      <p className="text-slate-400 text-lg mb-12 max-w-sm">
        Cada jugador debe decir una palabra o frase corta descriptiva. <br/><br/>
        Al final de la ronda, todos deben votar quién creen que es el impostor.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <button 
          onClick={() => setGameState(prev => ({ ...prev, screen: GameScreen.HOME }))}
          className="w-full py-4 rounded-2xl bg-slate-800 text-white font-bold border border-slate-700 flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> FINALIZAR PARTIDA
        </button>
        <button 
          onClick={() => {
            startGame();
          }}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20"
        >
          REPETIR CON ESTOS AJUSTES
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {gameState.screen === GameScreen.HOME && renderHome()}
      {gameState.screen === GameScreen.SETUP && renderSetup()}
      {gameState.screen === GameScreen.REVEAL && renderReveal()}
      {gameState.screen === GameScreen.DEBATE && renderDebate()}
    </div>
  );
};

export default App;
