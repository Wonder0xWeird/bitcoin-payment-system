# Bitcoin Payment System - Product Requirements Document (PRD)

## 1. Key Requirements Analysis

### Core Functional Requirements:
1. **HD Wallet Generation**: Generate a new hierarchical deterministic wallet for testnet Bitcoin
2. **Payment Form**: User interface to input BTC amount for payment requests
3. **QR Code Generation**: Display QR code containing payment request (address + amount)
4. **Payment Polling**: Continuously check for incoming payments and update UI
5. **Status Display**: Show payment status (pending, received, error states)

### Technical Requirements:
- **Framework**: Next.js application
- **Network**: Bitcoin testnet only
- **Responsiveness**: Mobile-friendly UI
- **Error Handling**: Comprehensive error and loading states
- **Code Quality**: Clean, modular, extensible architecture

### Non-Requirements (for this test):
- Wallet persistence (ephemeral wallets are acceptable)
- Production Bitcoin network support
- User authentication/accounts
- Payment history
- Multi-currency support

## 2. Technology Stack & Package Considerations

### Core Framework:
- **Next.js 15.3**: React framework with app router
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS v4**: Utility-first CSS framework for responsive design

### Bitcoin/Crypto Libraries:
- **@scure/btc-signer**: Modern, audited Bitcoin library (primary choice)
- **bitcoinjs-lib**: Fallback/compatibility for ecosystem tools
- **bip39**: Mnemonic phrase generation (12-word seeds)
- **bip32**: HD wallet derivation (BIP44 paths)

### QR Code Generation:
- **qrcode**: QR code generation for payment requests
- **react-qr-code**: React component wrapper for QR codes

### API Integration:
- **axios** or **fetch**: HTTP client for blockchain API calls
- **BlockCypher API**: Testnet transaction monitoring (primary)

### UI Components:
- **@headlessui/react**: Accessible UI components
- **react-hot-toast**: Toast notifications for status updates
- **lucide-react**: Icon library

### Development Tools:
- **ESLint + Prettier**: Code formatting and linting
- **Husky**: Git hooks for code quality

## 3. Architecture Diagram (Single Next.js App)

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                       CLIENT SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Payment Form  │  │   QR Display    │  │  Status Monitor │  │
│  │   Component     │  │   Component     │  │   Component     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                │                                │
│                                ▼                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CLIENT-SIDE SERVICES                          │ │
│  │  • QR Generation (browser-safe)                            │ │
│  │  • Payment URI formatting                                  │ │
│  │  • API client functions                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       SERVER SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ /api/wallet     │  │ /api/payment    │  │ /api/status     │  │
│  │                 │  │                 │  │                 │  │
│  │ • POST: create  │  │ • POST: create  │  │ • GET: check    │  │
│  │   new wallet    │  │   payment req   │  │   payment       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                │                                │
│                                ▼                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                SERVER-SIDE SERVICES                        │ │
│  │                   (lib/services/)                          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │ │
│  │  │   Wallet    │ │  Payment    │ │   Blockchain API    │   │ │
│  │  │   Service   │ │   Service   │ │     Service         │   │ │
│  │  │             │ │             │ │                     │   │ │
│  │  │ • HD wallet │ │ • Validate  │ │ • BlockCypher API   │   │ │
│  │  │   generation│ │   amounts   │ │ • BlockCypher API   │   │ │
│  │  │ • Address   │ │ • Check     │ │ • Error handling    │   │ │
│  │  │   derivation│ │   payments  │ │ • Rate limiting     │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │ BlockCypher API │              │  BlockCypher    │           │
│  │ (Primary)       │              │  (Fallback)     │           │
│  │                 │              │                 │           │
│  │ • Testnet data  │              │ • Testnet data  │           │
│  │ • Address info  │              │ • Address info  │           │
│  │ • Transaction   │              │ • Transaction   │           │
│  │   monitoring    │              │   monitoring    │           │
│  └─────────────────┘              └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure:
```
src/
├── app/                          # Next.js 14 app router
│   ├── layout.tsx               
│   ├── page.tsx                 # Main payment interface
│   └── api/                     # Serverless API routes
│       ├── wallet/route.ts      
│       ├── payment/route.ts     
│       └── status/route.ts      
├── lib/
│   ├── services/                # Server-side service classes
│   │   ├── WalletService.ts     # HD wallet operations
│   │   ├── PaymentService.ts    # Payment validation/checking
│   │   └── BlockchainService.ts # External API integration
│   ├── utils/                   # Shared utilities
│   │   ├── bitcoin.ts           # Bitcoin-specific helpers
│   │   └── validation.ts        # Input validation
│   └── types/                   # TypeScript definitions
├── components/                  # React components
│   ├── PaymentForm.tsx
│   ├── QRDisplay.tsx
│   └── StatusMonitor.tsx
└── hooks/                       # Custom React hooks
    └── usePaymentPolling.ts
```

## 4. Data Flow

```
1. User loads page → Generate HD wallet → Display new address
                                       ↓
2. User enters amount → Create payment request → Generate QR code
                                              ↓
3. Display QR code → Start polling → Check blockchain APIs
                                  ↓
4. Payment detected → Update UI → Show success message
```

## 5. Implementation Plan

### Phase 1: Project Setup & Foundation (30 mins)
- [x] Initialize Next.js project with TypeScript
- [x] Install core dependencies (Bitcoin libs, UI libs)
- [x] Set up project structure and folders
- [x] Configure Tailwind CSS and basic styling
- [x] Create initial layout and routing

### Phase 2: Core Bitcoin Services (45 mins)
- [x] Implement HD wallet generation service
- [x] Create address derivation utilities
- [x] Set up Bitcoin testnet configuration
- [x] Add QR code generation service
- [x] Create payment URI formatting

### Phase 3: API Routes (30 mins)
- [x] `/api/wallet` - Generate new wallet endpoint
- [x] `/api/payment` - Create payment request endpoint  
- [x] `/api/status` - Check payment status endpoint
- [x] Integrate with BlockCypher API
- [x] Add error handling and validation

### Phase 4: Frontend Components (60 mins)
- [x] Payment form component with amount input
- [x] QR code display component
- [x] Payment status monitoring component
- [x] Loading states and error handling
- [x] Responsive design implementation

### Phase 5: Payment Polling & Status (45 mins)
- [x] Implement payment polling logic
- [x] Real-time status updates
- [x] Handle payment confirmation
- [x] Add toast notifications
- [x] Timeout and error handling

### Phase 6: Polish & Documentation (30 mins)
- [x] Add comprehensive error handling
- [x] Implement loading skeletons
- [x] Create comprehensive README
- [x] Include setup and run instructions
- [x] Add environment variable documentation
- [x] Finalize code cleanup and documentation

### Phase 7: Testing & Deployment (15 mins)
- [x] Test edge cases (invalid amounts, network errors)
- [x] Mobile responsiveness testing  
- [ ] Create remote GitHub repository
- [ ] Deploy test application

## 6. Key Technical Decisions

### Architecture Pattern:
- **Single Next.js Application**: All functionality within one app using app router
- **Service Classes**: Traditional service layer pattern with TypeScript classes in `lib/services/`
- **Server-Side Services**: Bitcoin operations run server-side for security (private keys never touch client)
- **Client-Side Services**: UI-focused utilities (QR generation, API calls, formatting)
- **API Routes**: Next.js serverless functions for clean separation of concerns

### Wallet Strategy:
- Generate new HD wallet on each session (as per requirements)
- Use BIP44 derivation path for testnet: `m/44'/1'/0'/0/0`
- Store wallet data in component state (no persistence needed)
- **Security**: All wallet operations happen server-side, only public addresses sent to client

### Payment Detection:
- Poll blockchain APIs every 10 seconds using custom React hook
- Check for payments received after request creation timestamp
- Handle partial payments and overpayments
- Implement exponential backoff for failed API calls
- **Client-side polling**: React hook manages polling lifecycle and state

### QR Code Format:
- Use BIP21 URI format: `bitcoin:address?amount=X&label=Payment`
- Include amount in BTC (not satoshis) for user readability
- Add fallback text display for copy/paste
- **Browser-safe**: QR generation happens client-side using lightweight libraries

### Error Handling:
- Network timeouts and API failures
- Invalid payment amounts (negative, too large, etc.)
- Malformed addresses or wallet generation failures
- Rate limiting from blockchain APIs
- **Graceful degradation**: UI continues to function even with API failures

## 7. Success Metrics

- [ ] Wallet generation works consistently
- [ ] QR codes display correctly and are scannable
- [ ] Payment detection works within 30 seconds of transaction broadcast
- [ ] UI is responsive on mobile and desktop
- [ ] All error states are handled gracefully
- [ ] Code is clean, modular, and well-documented

## 8. Potential Improvements (Future Considerations)

1. **Persistence**: Add wallet persistence with encryption
2. **Multiple Addresses**: Generate new address for each payment
3. **Payment History**: Store and display previous transactions
4. **Websockets**: Real-time updates instead of polling
5. **Fee Estimation**: Display recommended transaction fees
6. **Multi-signature**: Support for multi-sig wallets
7. **Lightning Network**: Integration with Lightning for instant payments
8. **Security**: Hardware wallet integration for production use