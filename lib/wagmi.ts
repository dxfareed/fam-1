import { http, createConfig, webSocket, fallback } from 'wagmi';
import { base,baseSepolia } from 'wagmi/chains';
import {farcasterMiniApp} from '@farcaster/miniapp-wagmi-connector'
import { walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const in_rpc_url = process.env.BASE_SEPOLIA_RPC_URL

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    /* [base.id]: fallback([
      http(in_rpc_url),
    ]),
     */
    [baseSepolia.id]:fallback([
      http(in_rpc_url),
    ]),
  },
  ssr:true,
  connectors: [
    farcasterMiniApp(),
    walletConnect({ projectId, showQrModal: true }),
  ]
})