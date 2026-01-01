
export enum GameScreen {
  HOME = 'HOME',
  SETUP = 'SETUP',
  WORD_SOURCE = 'WORD_SOURCE',
  REVEAL = 'REVEAL',
  DEBATE = 'DEBATE'
}

export enum WordSourceType {
  PREDEFINED = 'PREDEFINED',
  AI_CELEBRITY = 'AI_CELEBRITY',
  CUSTOM_FILE = 'CUSTOM_FILE'
}

export interface PlayerRole {
  id: number;
  role: 'CITIZEN' | 'IMPOSTOR';
  secretWord: string;
}

export interface GameConfig {
  playerCount: number;
  impostorCount: number;
  wordSource: WordSourceType;
  selectedCategory?: string;
}

export interface GameState {
  screen: GameScreen;
  config: GameConfig;
  players: PlayerRole[];
  currentWord: string;
  currentPlayerIndex: number;
  revealState: 'WAITING_FOR_PLAYER' | 'READY_TO_SEE' | 'VIEWING' | 'PASSED';
}
