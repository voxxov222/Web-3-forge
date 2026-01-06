
export type InfraTemplate = 'full-stack' | 'node-only' | 'api-gateway' | 'custom-network';

export type NetworkStatusType = 'UP' | 'DOWN' | 'DEGRADED' | 'MAINTENANCE';

export interface Network {
  id: string;
  name: string;
  description: string;
  color: string;
  isAvailable: boolean;
  status?: NetworkStatusType;
}

export interface InstanceSize {
  id: string;
  name: string;
  price: string;
  specs: string;
}

export type NodeType = 'full' | 'archive' | 'light';

export interface CustomNetworkParams {
  chainName: string;
  consensus: 'PoS' | 'PoA' | 'IBFT2';
  blockTime: number;
  gasLimit: number;
  nativeToken: string;
}

export interface SmartContractLab {
  template: 'ERC20' | 'ERC721' | 'ERC1155' | 'Anchor-Rust' | 'Custom';
  code: string;
  deploymentStatus: 'idle' | 'compiling' | 'deploying' | 'success';
}

export interface DeploymentData {
  briefing: string;
  script: string;
  logs: string[];
  status: 'initializing' | 'compiling' | 'uploading' | 'verifying' | 'complete';
}

export interface OnboardingState {
  step: number;
  template: InfraTemplate;
  selectedNetworks: string[];
  nodeType: NodeType;
  instanceSizeId: string;
  crossChainEnabled: boolean;
  customNetwork?: CustomNetworkParams;
  contractLab?: SmartContractLab;
  isDeploying?: boolean;
}

export interface User {
  id: string;
  email?: string;
  walletAddress?: string;
  chainId?: string;
  authMethod: 'email' | 'wallet';
}

export interface SavedConfig extends OnboardingState {
  id: string;
  user_id: string;
  created_at: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
