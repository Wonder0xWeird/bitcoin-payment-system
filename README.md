# Bitcoin Payment System

A modern, full-stack Bitcoin payment system built with Next.js, featuring HD wallet generation, QR code payments, and real-time transaction monitoring on Bitcoin Testnet4.


## 🚀 Features

- **HD Wallet Generation**: Automatic generation of hierarchical deterministic wallets using BIP44 derivation paths
- **Payment Requests**: Create payment requests with custom amounts and generate BIP21-compatible URIs
- **QR Code Generation**: Scannable QR codes for easy mobile wallet integration
- **Real-time Monitoring**: Continuous monitoring of Bitcoin Testnet4 for incoming payments
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Toast Notifications**: Real-time feedback for all user actions and payment status updates
- **Error Handling**: Comprehensive error handling with user-friendly error messages


## 🔧 Installation

### 📋 Prerequisites

- Node.js 18.18.0 or higher (Next.js 15 requirement)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

### 📝 Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Wonder0xWeird/bitcoin-payment-system.git
   cd bitcoin-payment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)


### Staging Environment

To test and explore a staged production version of the app deployed to Vercel, visit [https://btc-pay-w0nd3rs-projects.vercel.app/](https://btc-pay-w0nd3rs-projects.vercel.app/)


## 📱 Usage Guide

### 1. Wallet Generation
- The application automatically generates a new HD wallet when you first visit
- Each wallet includes a unique Bitcoin Testnet4 address
- Click the new wallet button in the header to generate a fresh wallet at any time

### 2. Create Payment Request
- Enter the desired Bitcoin amount (supports up to 8 decimal places)
- Use quick amount buttons for common values (e.g. 0.001, 0.01, 0.1, etc. BTC)
- Click "Create Payment Request" to generate the request

### 3. Share Payment Information
- **QR Code**: Scan with any Bitcoin wallet app with support for Testnet4
- **Address**: Copy the Bitcoin address for manual entry
- **BIP21 URI**: Complete payment URI with amount and metadata
- **Open in Wallet**: Direct link to open in default Bitcoin wallet

### 4. Monitor Payment Status
- Payment monitoring initiates automatically upon payment request creation
- System checks for payments every 60 seconds
- Pause/Resume/Restart monitoring with the control buttons
- Receive instant notifications when payments arrive
- Track confirmations of received payments direclty in the app
- View transaction details on Mempool.space blockchain explorer

## 🧪 Testing

The application can be tested using:

1. **Bitcoin Wallet**:
   - Any Bitcoin wallet application supporting Testnet4
      - Example: [BitPay Testnet4 Wallet Setup](https://support.bitpay.com/hc/en-us/articles/360015463612-How-to-Create-a-Testnet-Wallet)

2. **Bitcoin Testnet4 Faucet**:
   - [Mempool.space Testnet4 Faucet](https://mempool.space/testnet4/faucet)

---

# ⚙️ Implementation Details

## 🛠 Tech Stack

### Frontend
- **TypeScript** - Type-safe development
- **Next.js 15.3** - Single Page App via React framework
- **Tailwind CSS v3** - Utility-first CSS framework
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
- **Mempool.space API** - Bitcoin Testnet4 blockchain REST API (no API key required)
- **Bitcoin Testnet4** - Modern, active testing environment

## 🔑 Bitcoin Standards Implemented
- **BIP32**: Hierarchical Deterministic Wallets
- **BIP39**: Mnemonic code for generating deterministic keys
- **BIP44**: Multi-Account Hierarchy for Deterministic Wallets
- **BIP21**: URI Scheme for Bitcoin payments
- **P2WPKH**: Pay to Witness Public Key Hash (SegWit)

## 🛡 Security Features

- **Server-side Key Generation**: Private keys + mnemonic never leave the server
- **Input Validation**: Comprehensive validation of all user inputs
- **Error Handling**: Graceful handling of API failures and network issues
- **Testnet4 Only**: Safe testing environment with no real Bitcoin at risk

## ⚠️ Important Notes

- **Demonstration Purpose**: Built for learning and demonstration
- **No Persistence**: Wallets are ephemeral and not stored between sessions
- **No API Key Required**: Uses mempool.space which provides generous free API limits

## 🔮 Potential Improvements (Future Considerations)

1. **Multiple Addresses**: Generate new address for each payment using HD wallet functionality
2. **Wallet Security**: Store wallet private key and mnemonic with encryption
3. **Payment History**: Store and display previous transactions
4. **Pagination**: Add pagination logic for querying wallets with many transactions
4. **Websockets**: Real-time updates instead of polling
5. **Fee Estimation**: Display recommended transaction fees
6. **Multi-signature**: Support for multi-sig wallets
7. **Lightning Network**: Integration with Lightning for instant payments
8. **Security**: Hardware wallet integration for production use


## 🏗 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── wallet/route.ts       # Wallet generation
│   │   ├── payment/route.ts      # Payment requests
│   │   └── status/route.ts       # Payment status
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main application page
│   ├── globals.css               # Global styles
│   └── favicon.ico               # App icon
├── components/                   # React components
│   ├── Header/                   # App header components
│   │   ├── index.tsx             # Header main component
│   │   ├── Branding.tsx          # App logo and title
│   │   └── Profile.tsx           # Wallet info and actions
│   ├── PaymentForm/              # Payment creation components
│   │   ├── index.tsx             # PaymentForm main component
│   │   ├── Title.tsx             # Form title
│   │   ├── Instructions.tsx      # User instructions
│   │   └── Form/                 # Form components
│   │       ├── index.tsx         # Form logic and layout
│   │       ├── Header.tsx        # Form header
│   │       ├── PresetAmounts.tsx # Quick amount buttons
│   │       └── SubmitButton.tsx  # Submit button component
│   ├── PaymentMonitor/           # Payment monitoring components
│   │   ├── index.tsx             # PaymentMonitor main component
│   │   ├── Header.tsx            # Monitor header
│   │   ├── Instructions.tsx      # Monitoring instructions
│   │   ├── RequestInfo.tsx       # Payment request details & QR
│   │   ├── Status.tsx            # Payment status display
│   │   ├── ControllButtons.tsx   # Start/stop/pause controls
│   │   ├── PollError.tsx         # General polling errors
│   │   └── RateLimitError.tsx    # Rate limit specific errors
│   ├── ApplicationProvider.tsx   # App context provider
│   ├── Loading.tsx               # Loading spinner component
│   ├── ErrorInfo.tsx             # Error display component
│   ├── Footer.tsx                # App footer
│   └── index.ts                  # Component exports
├── hooks/                        # Custom React hooks
│   └── usePaymentPolling.ts      # Payment polling logic
├── lib/                          # Core libraries
│   ├── services/                 # Business logic services
│   │   ├── WalletService.ts      # HD wallet operations
│   │   ├── PaymentService.ts     # Payment validation & creation
│   │   ├── BlockchainService.ts  # Bitcoin blockchain operations
│   │   └── MempoolHttpService.ts # Mempool.space API client
│   ├── types/                    # TypeScript definitions
│   │   ├── index.ts              # Type exports
│   │   ├── api.ts                # API response types
│   │   ├── payment.ts            # Payment related types
│   │   ├── wallet.ts             # Wallet types
│   │   ├── transaction.ts        # Transaction types
│   │   └── provider.ts           # Mempool provider types
│   └── utils/                    # Utility functions
│       ├── bitcoin.ts            # Bitcoin utilities
│       ├── validation.ts         # Input validation
│       └── http.ts               # HTTP utilities & errors
```

## 🤖 Cursor + Claude 4.0 Dev Logs

The initial project planning and scaffolding was completed with assistance from Claude 4.0 in Cursor.

Complete chat and revision history from this phase can be found in the `.cursor` directory in the project root.

## 📄 License

This project is licensed under the MIT License

## 🙏 Acknowledgments

- [Mempool.space](https://mempool.space/) for the reliable Bitcoin API
- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) for Bitcoin operations
- [Next.js](https://nextjs.org/) for the amazing framework
- Bitcoin community for the standards and protocols
- Cursor and Claude 4.0 Sonnet as cognitive collaborators

---

**⚠️ Disclaimer**: This application is for demonstration purposes only. Do not use with real Bitcoin or in production environments without proper security audits.