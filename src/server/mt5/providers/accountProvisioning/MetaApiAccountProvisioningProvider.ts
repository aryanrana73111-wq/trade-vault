import { AccountProvisioningProvider } from './AccountProvisioningProvider';
import { 
  BrokerCapabilities, 
  MT5CreateDemoInput, 
  MT5CreateLiveInput, 
  MT5CreationResult,
  MT5CreatedAccountCredentials,
  MT5ErrorCode
} from '../../../../types/mt5';
import { getBrokerCapabilities } from '../../../../lib/mt5BrokerDirectory';
import { mt5Connector } from '../../mt5Connector';

export class MetaApiAccountProvisioningProvider implements AccountProvisioningProvider {
  public readonly name = 'MetaApi';

  private readonly provisioningBaseUrl = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';
  private readonly managerBaseUrl = 'https://mt-manager-api-v1.new-york.agiliumtrade.ai';

  private getToken(): string | null {
    const token = process.env.META_API_TOKEN || 
                  process.env.MT5_API_KEY || 
                  process.env.MT5_PROVIDER_TOKEN || 
                  null;
    return token ? token.trim() : null;
  }

  public isConfigured(): boolean {
    const token = this.getToken();
    return Boolean(token && token.length > 5);
  }

  private getHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('MT5_CONNECTOR_NOT_CONFIGURED: META_API_TOKEN environment variable is not configured on the server.');
    }
    return {
      'auth-token': token,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return res;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('MT5_CONNECTION_TIMEOUT: Request to broker provisioning gateway timed out.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Return verified capabilities for a broker
   */
  async getBrokerCapabilities(brokerIdOrServer: string): Promise<BrokerCapabilities> {
    const caps = getBrokerCapabilities(brokerIdOrServer);
    return caps;
  }

  /**
   * Provision a real MT5 demo account via provider
   * Strictly adheres to real broker responses:
   * - Never creates Math.random() logins
   * - Never generates fake passwords
   * - Never reports success without external confirmation
   * - Performs automatic MT5 connection verification
   */
  async createDemoAccount(input: MT5CreateDemoInput, uid: string): Promise<MT5CreationResult> {
    if (!uid) {
      return {
        success: false,
        status: 'FAILED',
        errorCode: 'MT5_AUTH_FAILED',
        message: 'User authentication required.'
      };
    }

    if (!this.isConfigured()) {
      return {
        success: false,
        status: 'FAILED',
        errorCode: 'MT5_CONNECTOR_NOT_CONFIGURED',
        message: 'MT5 connector is not configured on the server. Configure META_API_TOKEN in server environment.'
      };
    }

    const brokerId = input.brokerId || 'unknown';
    const capabilities = await this.getBrokerCapabilities(brokerId);

    // Rule 5: Prop firms must never claim automated creation
    if (capabilities.category === 'prop') {
      return {
        success: false,
        status: 'UNSUPPORTED',
        brokerCapabilities: capabilities,
        errorCode: 'MT5_CREATION_UNSUPPORTED',
        message: `${capabilities.brokerName} is a proprietary trading firm. Prop evaluations and challenge accounts must be acquired directly through their official portal.`
      };
    }

    // Rule 4: If demo creation is unsupported for this broker
    if (!capabilities.demoCreationSupported) {
      return {
        success: false,
        status: 'UNSUPPORTED',
        brokerCapabilities: capabilities,
        errorCode: 'MT5_CREATION_UNSUPPORTED',
        message: `Demo creation is not available for ${capabilities.brokerName} through TradeVault. Please open an account on the official broker website.`
      };
    }

    const headers = this.getHeaders();

    try {
      // 1. Check for active provisioning profile on MetaApi
      let profileId = process.env.META_API_PROVISIONING_PROFILE_ID || capabilities.provisioningProfileId;

      if (!profileId) {
        // Query MetaApi provisioning profiles list
        const profileRes = await this.fetchWithTimeout(
          `${this.provisioningBaseUrl}/users/current/provisioning-profiles`,
          { method: 'GET', headers },
          8000
        ).catch(() => null);

        if (profileRes && profileRes.ok) {
          const profiles: any[] = await profileRes.json().catch(() => []);
          const matched = profiles.find((p: any) => 
            p.version === 5 && 
            (p.name?.toLowerCase().includes(capabilities.brokerId) || 
             p.name?.toLowerCase().includes(capabilities.brokerName.toLowerCase()))
          );
          if (matched && matched.id) {
            profileId = matched.id;
          }
        }
      }

      if (!profileId) {
        return {
          success: false,
          status: 'UNSUPPORTED',
          brokerCapabilities: capabilities,
          errorCode: 'MT5_CREATION_UNSUPPORTED',
          message: `Automated MT5 demo account creation for ${capabilities.brokerName} requires an active broker provisioning profile configured on MetaApi. Please register a free demo on the official broker website.`
        };
      }

      // 2. Call real MetaApi MT Manager API to create account
      const deposit = Number(input.deposit || input.balance || 10000);
      const leverage = Number(input.leverage || 100);
      const email = input.email || `trader-${uid.slice(0, 8)}@tradevault.internal`;

      const createRes = await this.fetchWithTimeout(
        `${this.managerBaseUrl}/users/current/mt5/provisioning-profiles/${profileId}/accounts`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email,
            leverage,
            group: 'demo\\demoforex',
            balance: deposit,
            firstName: input.name?.split(' ')[0] || 'TradeVault',
            lastName: input.name?.split(' ').slice(1).join(' ') || 'Trader'
          })
        },
        20000
      );

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        const errMessage = errData.message || createRes.statusText || 'Broker rejected demo creation request';
        return {
          success: false,
          status: 'FAILED',
          brokerCapabilities: capabilities,
          errorCode: 'MT5_CREATION_FAILED',
          message: `Broker provisioning error: ${errMessage}`
        };
      }

      const createdData = await createRes.json();
      const login = String(createdData.login || createdData.accountNumber || '').trim();
      const password = createdData.password || createdData.masterPassword;
      const investorPassword = createdData.investorPassword;
      const returnedServer = createdData.server || input.server || 'MT5-Demo';

      if (!login || !password) {
        return {
          success: false,
          status: 'FAILED',
          brokerCapabilities: capabilities,
          errorCode: 'MT5_CREATION_FAILED',
          message: 'Broker responded but did not return valid account credentials.'
        };
      }

      const credentialsPayload: MT5CreatedAccountCredentials = {
        login,
        password,
        investorPassword,
        server: returnedServer,
        platform: 'mt5',
        broker: capabilities.brokerName,
        balance: deposit,
        leverage,
        verificationStatus: 'NEEDS_VERIFICATION',
        createdAt: Date.now()
      };

      // 3. Step 8: AUTOMATIC MT5 LOGIN VERIFICATION
      // created account -> TradeVault connection verification -> actual provider authentication -> account_info -> server verification -> success
      try {
        const verifyResult = await mt5Connector.connect({
          accountNumber: login,
          server: returnedServer,
          investorPassword: password,
          broker: capabilities.brokerName,
          challengeStartingBalance: deposit,
          startingBalance: deposit,
          connectionType: 'demo',
          label: `${capabilities.brokerName} Demo`
        }, uid);

        if (verifyResult.success && verifyResult.account) {
          credentialsPayload.verificationStatus = 'READY';
          credentialsPayload.verificationMessage = 'Successfully authenticated and verified with broker terminal.';

          return {
            success: true,
            status: 'READY',
            message: 'MT5 Account Ready: Account successfully created and authenticated with broker.',
            credentials: credentialsPayload,
            account: verifyResult.account,
            brokerCapabilities: capabilities
          };
        } else {
          credentialsPayload.verificationStatus = 'NEEDS_VERIFICATION';
          credentialsPayload.verificationMessage = verifyResult.message || 'Connection verification pending';

          return {
            success: true,
            status: 'NEEDS_VERIFICATION',
            message: `Account created by broker (Login: ${login}), but verification is pending: ${verifyResult.message || 'Verification needed'}.`,
            credentials: credentialsPayload,
            brokerCapabilities: capabilities
          };
        }
      } catch (verifyErr: any) {
        credentialsPayload.verificationStatus = 'NEEDS_VERIFICATION';
        credentialsPayload.verificationMessage = verifyErr?.message || 'Login verification could not complete immediately';

        return {
          success: true,
          status: 'NEEDS_VERIFICATION',
          message: `MT5 demo account provisioned by broker (Login: ${login}), but initial login verification reported: ${verifyErr?.message || 'Verification error'}.`,
          credentials: credentialsPayload,
          brokerCapabilities: capabilities
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        brokerCapabilities: capabilities,
        errorCode: 'MT5_CREATION_FAILED',
        message: err?.message || 'Failed to communicate with broker provisioning service.'
      };
    }
  }

  /**
   * Request live account creation
   * Strictly informs user that live accounts require broker-side KYC and approval
   */
  async createLiveAccount(input: MT5CreateLiveInput, uid: string): Promise<MT5CreationResult> {
    const brokerId = input.brokerId || 'unknown';
    const capabilities = await this.getBrokerCapabilities(brokerId);

    return {
      success: false,
      status: 'UNSUPPORTED',
      brokerCapabilities: capabilities,
      errorCode: 'MT5_CREATION_UNSUPPORTED',
      message: `Live MT5 account creation for ${capabilities.brokerName} requires identity verification (KYC), regulatory compliance, and broker-side approval. Please apply directly through the official broker website.`
    };
  }
}

export const metaApiAccountProvisioningProvider = new MetaApiAccountProvisioningProvider();
