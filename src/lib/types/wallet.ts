export interface HDWallet {
  mnemonic: string;
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface PublicWalletInfo {
  address: string;
  publicKey: string;
}