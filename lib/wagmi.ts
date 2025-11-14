import { http, createConfig, webSocket, fallback } from 'wagmi';
import { base } from 'wagmi/chains';
import {farcasterMiniApp} from '@farcaster/miniapp-wagmi-connector'
import { walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const in_rpc_url = process.env.NEXT_PUBLIC_HTTPS_IN_URL

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]:fallback([
      http(in_rpc_url),
    ]),
  },
  ssr:true,
  connectors: [
    farcasterMiniApp(),
    walletConnect({ projectId, showQrModal: true }),
  ]
})