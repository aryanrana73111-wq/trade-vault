import { 
  BrokerCapabilities, 
  MT5CreateDemoInput, 
  MT5CreateLiveInput, 
  MT5CreationResult 
} from '../../../../types/mt5';

export interface AccountProvisioningProvider {
  readonly name: string;

  /**
   * Whether the external provisioning gateway is configured
   */
  isConfigured(): boolean;

  /**
   * Returns explicit broker capabilities regarding MT5 automated provisioning
   */
  getBrokerCapabilities(brokerIdOrServer: string): Promise<BrokerCapabilities>;

  /**
   * Provision a real MT5 demo account through the external provider/broker
   */
  createDemoAccount(input: MT5CreateDemoInput, uid: string): Promise<MT5CreationResult>;

  /**
   * Request live MT5 account creation (or return KYC portal guidance if broker requires KYC)
   */
  createLiveAccount(input: MT5CreateLiveInput, uid: string): Promise<MT5CreationResult>;

  /**
   * Optional: Poll creation/deployment status for asynchronous provisioning workflows
   */
  getCreationStatus?(taskId: string): Promise<{
    status: 'CREATED' | 'DEPLOYED' | 'READY' | 'FAILED' | 'PENDING';
    message?: string;
  }>;
}
