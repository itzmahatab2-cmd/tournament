export interface RegistrationData {
  id: string;
  timestamp: string;
  // Team Info
  teamName: string;
  gameName: string;
  
  // Leader Info
  leaderName: string;
  leaderPhone: string;
  leaderEmail?: string;
  
  // Players
  player1: string; // Leader
  player2: string;
  player3: string;
  player4: string;
  
  // Additional
  discordUsername?: string;
  ingameId?: string;
  paymentMethod: string;
  transactionId: string;
  
  // Meta
  agreedToRules: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export enum GameOptions {
  VALORANT = 'Valorant',
  CS2 = 'Counter-Strike 2',
  LOL = 'League of Legends',
  DOTA2 = 'Dota 2',
  PUBG_MOBILE = 'PUBG Mobile',
  FREE_FIRE = 'Free Fire',
  OTHER = 'Other'
}

export enum PaymentMethods {
  BKASH = 'Bkash',
  NAGAD = 'Nagad',
  ROCKET = 'Rocket'
}