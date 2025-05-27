export interface HDWallet {
  mnemonic: string;
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface WalletInfo {
  address: string;
  publicKey: string;
}