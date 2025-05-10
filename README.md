# 🎵 Royalty Tracking DApp

A decentralized royalty tracking and distribution system for musicians, ensuring transparent and fair payments using blockchain technology.


---

## 🌟 Features

- 🎧 **Smart Contracts** for automated royalty distribution
- 🎼 **NFT Integration** to represent music rights
- 📊 **Decentralized Streaming Analytics**
- 💸 **Direct Wallet Payments** for artists
- 🔍 **Transparent Ledger** on-chain
- 🔐 **Role-Based Access** (Artist, Listener, Distributor)
- 🖼️ **IPFS/Arweave** for decentralized metadata

---

## 🛠️ Tech Stack

**Frontend:**
- TypeScript
- JavaScript
- HTML / CSS

**Backend:**
- Node.js
- Express.js
- MongoDB
- dotenv

**Blockchain:**
- Solidity
- Hardhat / Truffle
- Ethereum / Polygon

**Other:**
- IPFS / Arweave
- Metamask / WalletConnect

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/royalty-tracking-dapp.git
cd royalty-tracking-dapp
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 🚀 Usage

### Start Local Blockchain

```bash
npx hardhat node
```

### Deploy Smart Contracts

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Start Backend Server

```bash
cd backend
npm start
```

### Start Frontend App

```bash
cd frontend
npm run dev
```

---

## 🌐 Environment Setup

Create `.env` files in the `backend/` and `frontend/` directories:

**backend/.env**
```env
MONGODB_URI=mongodb://localhost:27017/royalty-dapp
PORT=5000
```

**frontend/.env**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

---

## 🧠 Project Structure

```
royalty-tracking-dapp/
├── backend/            # Express API
├── frontend/           # TypeScript/JS/HTML/CSS UI
├── contracts/          # Solidity contracts
├── scripts/            # Deployment scripts
├── .env                # Environment variables
└── README.md
```

---


---

## 🧑‍💻 Contributors

- [@ArundhatiBera](https://github.com/ArundhatiBera)
- [@soumyaja29](https://github.com/soumyaja29)
 
---


