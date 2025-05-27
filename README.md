# Bitcoin Payment System

A modern, full-stack Bitcoin payment system built with Next.js, featuring HD wallet generation, QR code payments, and real-time transaction monitoring on Bitcoin testnet.

## 🚀 Features

- **HD Wallet Generation**: Automatic generation of hierarchical deterministic wallets using BIP44 derivation paths
- **Payment Requests**: Create payment requests with custom amounts and generate BIP21-compatible URIs
- **QR Code Generation**: Scannable QR codes for easy mobile wallet integration
- **Real-time Monitoring**: Continuous monitoring of Bitcoin testnet for incoming payments
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Toast Notifications**: Real-time feedback for all user actions and payment status updates
- **Error Handling**: Comprehensive error handling with user-friendly error messages

## 🛠 Tech Stack

### Frontend
- **Next.js 15.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Hot Toast** - Toast notification system
- **QRCode.react** - QR code generation

### Backend
- **Next.js API Routes** - Serverless functions
- **bitcoinjs-lib v6.1.7** - Bitcoin operations and address generation
- **bip39 v3.1.0** - Mnemonic phrase generation
- **bip32 v5.0.0-rc.0** - HD wallet derivation
- **tiny-secp256k1 v2.2.3** - Elliptic curve cryptography

### External Services
- **Mempool.space API** - Bitcoin testnet4 blockchain data (no API key required)
- **Bitcoin Testnet4** - Modern, active testing environment

## 📋 Prerequisites

- Node.js 18.18.0 or higher (Next.js 15 requirement)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bitcoin-payment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **No API Setup Required**
   ```bash
   # The application uses mempool.space which provides
   # generous free API limits without requiring authentication
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage Guide

### 1. Wallet Generation
- The application automatically generates a new HD wallet when you first visit
- Each wallet includes a unique Bitcoin testnet4 address
- Click "New Wallet" to generate a fresh wallet at any time

### 2. Create Payment Request
- Enter the desired Bitcoin amount (supports up to 8 decimal places)
- Use quick amount buttons for common values (0.001, 0.01, 0.1, 1 BTC)
- Click "Create Payment Request" to generate the request

### 3. Share Payment Information
- **QR Code**: Scan with any Bitcoin wallet app
- **Address**: Copy the Bitcoin address for manual entry
- **BIP21 URI**: Complete payment URI with amount and metadata
- **Open in Wallet**: Direct link to open in default Bitcoin wallet

### 4. Monitor Payment Status
- Click "Start Payment Monitoring" to begin real-time monitoring
- System checks for payments every 10 seconds
- Receive instant notifications when payments arrive
- View transaction details on blockchain explorer

## 🔑 Bitcoin Standards Implemented

- **BIP32**: Hierarchical Deterministic Wallets
- **BIP39**: Mnemonic code for generating deterministic keys
- **BIP44**: Multi-Account Hierarchy for Deterministic Wallets
- **BIP21**: URI Scheme for Bitcoin payments
- **P2WPKH**: Pay to Witness Public Key Hash (SegWit)

## 🌐 API Endpoints

### POST /api/wallet
Generate a new HD wallet
```json
{
  "success": true,
  "data": {
    "address": "tb1q...",
    "publicKey": "03...",
    "mnemonic": "word1 word2 ..."
  }
}
```

### POST /api/payment
Create a payment request
```json
{
  "address": "tb1q...",
  "amount": 0.001,
  "label": "Payment Request",
  "message": "Optional message"
}
```

### GET /api/status
Check payment status
```
GET /api/status?address=tb1q...&amount=0.001&createdAt=2024-01-01T00:00:00.000Z
```

## 🏗 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── wallet/route.ts  # Wallet generation
│   │   ├── payment/route.ts # Payment requests
│   │   └── status/route.ts  # Payment status
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application
├── components/              # React components
│   ├── PaymentForm.tsx      # Payment amount input
│   ├── QRDisplay.tsx        # QR code and payment info
│   └── StatusMonitor.tsx    # Payment monitoring
├── hooks/                   # Custom React hooks
│   └── usePaymentPolling.ts # Payment polling logic
├── lib/                     # Core libraries
│   ├── services/            # Business logic
│   │   ├── WalletService.ts # HD wallet operations
│   │   ├── PaymentService.ts# Payment validation
│   │   └── BlockchainService.ts # Mempool.space integration
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
│       ├── bitcoin.ts       # Bitcoin utilities
│       └── validation.ts    # Input validation
```

## 🛡 Security Features

- **Server-side Key Generation**: Private keys never leave the server
- **Input Validation**: Comprehensive validation of all user inputs
- **Error Handling**: Graceful handling of API failures and network issues
- **Testnet Only**: Safe testing environment with no real Bitcoin at risk

## ⚠️ Important Notes

- **Testnet4 Only**: This application only works with Bitcoin testnet4
- **Educational Purpose**: Built for learning and demonstration
- **No Persistence**: Wallets are ephemeral and not stored between sessions
- **No API Key Required**: Uses mempool.space which provides generous free API limits

## 🧪 Testing

The application can be tested using:

1. **Bitcoin Testnet4 Faucets**:
   - [Mempool.space Testnet4 Faucet](https://mempool.space/testnet4)
   - [Bitcoin Testnet4 Faucet](https://testnet-faucet.mempool.co/)

2. **Wallet Apps**:
   - Any Bitcoin wallet supporting testnet4
   - Browser-based wallets for quick testing

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t bitcoin-payment-system .
docker run -p 3000:3000 bitcoin-payment-system
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [BlockCypher](https://www.blockcypher.com/) for the reliable Bitcoin API
- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) for Bitcoin operations
- [Next.js](https://nextjs.org/) for the amazing framework
- Bitcoin community for the standards and protocols

---

**⚠️ Disclaimer**: This is a demonstration application for educational purposes only. Do not use with real Bitcoin or in production environments without proper security audits.
