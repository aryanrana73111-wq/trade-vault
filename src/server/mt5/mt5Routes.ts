import express, { Request, Response } from 'express';
import { mt5Connector } from './mt5Connector';
import { searchMT5Brokers, getBrokerCapabilities } from '../../lib/mt5BrokerDirectory';
import { 
  MT5AccountCredentials, 
  MT5_ERROR_MESSAGES, 
  MT5ErrorCode,
  MT5CreateDemoInput,
  MT5CreateLiveInput
} from '../../types/mt5';
import { requireFirebaseAuth, AuthenticatedUserRequest, verifyAccountOwnership } from '../authMiddleware';
import { metaApiAccountProvisioningProvider } from './providers/accountProvisioning';

export function createMT5Router(): express.Router {
  const router = express.Router();

  // 1. Broker & Server Directory Search
  router.get('/brokers', (req, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const brokers = searchMT5Brokers(q);
      res.json({
        success: true,
        count: brokers.length,
        brokers
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to search brokers' });
    }
  });

  // Configuration status endpoint (publicly queryable to check if live MT5 provider is active)
  router.get('/config-status', async (_req: Request, res: Response) => {
    const configured = mt5Connector.isConfigured();
    res.json({
      success: true,
      configured,
      provider: mt5Connector.providerName,
      message: configured
        ? 'MT5 Cloud Gateway is configured.'
        : 'MT5 Cloud Gateway requires META_API_TOKEN in server environment.'
    });
  });

  // Apply Firebase Authentication to all following /api/mt5/* endpoints
  router.use(requireFirebaseAuth as express.RequestHandler);

  // 2. Verify Broker Server Connectivity via real provider
  router.post('/verify-server', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const { server } = req.body;
      if (!server) {
        res.status(400).json({ 
          success: false, 
          error: 'Server name is required.', 
          errorCode: 'MT5_SERVER_INVALID' 
        });
        return;
      }
      const result = await mt5Connector.verifyServer(server);
      res.json({
        success: result.reachable,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        error: err?.message || 'Server check failed',
        errorCode: 'MT5_PROVIDER_UNAVAILABLE'
      });
    }
  });

  // 3. Connect MT5 Account (Strictly Read-Only with Investor Password)
  // Backend derives uid strictly from verified Firebase token.
  router.post('/connect', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ 
          success: false, 
          error: 'Unauthorized: Valid Firebase session required.',
          errorCode: 'MT5_AUTH_FAILED'
        });
        return;
      }

      const credentials: MT5AccountCredentials = req.body;

      if (!credentials.server || !credentials.accountNumber) {
        res.status(400).json({ 
          success: false, 
          error: 'MT5 connection failed: Server and Login ID are required.',
          errorCode: 'MT5_SERVER_INVALID'
        });
        return;
      }

      if (!credentials.investorPassword) {
        res.status(400).json({ 
          success: false, 
          error: 'MT5 connection failed: Password is required.',
          errorCode: 'MT5_AUTH_FAILED'
        });
        return;
      }

      // Connect via real MT5 provider
      const result = await mt5Connector.connect(credentials, uid);

      res.json({
        success: true,
        message: result.message,
        account: result.account,
        accountInfo: result.accountInfo
      });
    } catch (err: any) {
      const errorCode: MT5ErrorCode = err?.errorCode || 'MT5_AUTH_FAILED';
      const msg = err?.message || MT5_ERROR_MESSAGES[errorCode] || 'MT5 connection failed';
      const status = errorCode === 'MT5_CONNECTOR_NOT_CONFIGURED' ? 503 :
                     errorCode === 'MT5_IDENTITY_MISMATCH' ? 403 :
                     errorCode === 'MT5_AUTH_FAILED' ? 401 : 400;

      res.status(status).json({ 
        success: false, 
        error: msg,
        errorCode
      });
    }
  });

  // 4. Live Connection Status (verifies ownership)
  router.get('/status/:accountId', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid!;
      const { accountId } = req.params;
      const options = {
        userToken: req.token,
        providerAccountId: (req.headers['x-provider-account-id'] as string) || (req.query.providerAccountId as string) || undefined,
        server: (req.query.server as string) || undefined
      };

      const ownership = await verifyAccountOwnership(uid, accountId, options);
      if (!ownership.allowed) {
        res.status(ownership.status).json({
          success: false,
          error: ownership.error,
          errorCode: ownership.errorCode
        });
        return;
      }

      const status = await mt5Connector.getConnectionStatus(accountId, uid, options);
      res.json({ success: true, ...status });
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        error: err?.message || 'Failed to get connection status',
        errorCode: 'MT5_PROVIDER_UNAVAILABLE'
      });
    }
  });

  // 5. Account Details (verifies ownership)
  router.get('/account/:accountId', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid!;
      const { accountId } = req.params;
      const options = {
        userToken: req.token,
        providerAccountId: (req.headers['x-provider-account-id'] as string) || (req.query.providerAccountId as string) || undefined,
        server: (req.query.server as string) || undefined
      };

      const ownership = await verifyAccountOwnership(uid, accountId, options);
      if (!ownership.allowed) {
        res.status(ownership.status).json({
          success: false,
          error: ownership.error,
          errorCode: ownership.errorCode
        });
        return;
      }

      const accountInfo = await mt5Connector.getAccountInfo(accountId, uid, options);
      res.json({ success: true, account: accountInfo });
    } catch (err: any) {
      res.status(404).json({ 
        success: false, 
        error: err?.message || 'Account not found',
        errorCode: err?.errorCode || 'MT5_ACCOUNT_NOT_FOUND'
      });
    }
  });

  // 6. Live Open Positions (verifies ownership)
  router.get('/positions/:accountId', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid!;
      const { accountId } = req.params;
      const options = {
        userToken: req.token,
        providerAccountId: (req.headers['x-provider-account-id'] as string) || (req.query.providerAccountId as string) || undefined,
        server: (req.query.server as string) || undefined
      };

      const ownership = await verifyAccountOwnership(uid, accountId, options);
      if (!ownership.allowed) {
        res.status(ownership.status).json({
          success: false,
          error: ownership.error,
          errorCode: ownership.errorCode
        });
        return;
      }

      const positions = await mt5Connector.getOpenPositions(accountId, uid, options);
      res.json({
        success: true,
        count: positions.length,
        positions
      });
    } catch (err: any) {
      const errorCode = err?.errorCode || 'MT5_POSITION_FETCH_FAILED';
      const status = errorCode === 'MT5_CONNECTOR_NOT_CONFIGURED' ? 503 :
                     errorCode === 'MT5_ACCOUNT_NOT_FOUND' ? 404 : 500;
      res.status(status).json({ 
        success: false, 
        error: err?.message || 'Failed to fetch live open positions',
        errorCode
      });
    }
  });

  // 7. Synchronize Historical Trades (verifies ownership)
  router.post('/sync/:accountId', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid!;
      const { accountId } = req.params;
      const options = {
        userToken: req.token,
        providerAccountId: (req.headers['x-provider-account-id'] as string) || req.body?.providerAccountId || (req.query.providerAccountId as string) || undefined,
        server: req.body?.server || (req.query.server as string) || undefined,
        currency: req.body?.currency || undefined
      };

      const ownership = await verifyAccountOwnership(uid, accountId, options);
      if (!ownership.allowed) {
        res.status(ownership.status).json({
          success: false,
          error: ownership.error,
          errorCode: ownership.errorCode
        });
        return;
      }

      const periodDays = req.body?.periodDays ? parseInt(req.body.periodDays, 10) : 30;
      const result = await mt5Connector.syncTrades(accountId, uid, periodDays, options);

      res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        error: err?.message || 'Trade sync failed',
        errorCode: err?.errorCode || 'MT5_SYNC_FAILED'
      });
    }
  });

  // 8. Disconnect Account (verifies ownership)
  router.post('/disconnect/:accountId', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid!;
      const { accountId } = req.params;
      const options = {
        userToken: req.token,
        providerAccountId: (req.headers['x-provider-account-id'] as string) || req.body?.providerAccountId || undefined
      };

      const ownership = await verifyAccountOwnership(uid, accountId, options);
      if (!ownership.allowed) {
        res.status(ownership.status).json({
          success: false,
          error: ownership.error,
          errorCode: ownership.errorCode
        });
        return;
      }

      const result = await mt5Connector.disconnect(accountId, uid, options);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        error: err?.message,
        errorCode: 'MT5_PROVIDER_UNAVAILABLE'
      });
    }
  });

  // 9. Data Integrity Diagnostics (verifies ownership)
  router.get('/diagnostics/:accountId', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid!;
      const { accountId } = req.params;
      const options = {
        userToken: req.token,
        providerAccountId: (req.headers['x-provider-account-id'] as string) || (req.query.providerAccountId as string) || undefined
      };

      const ownership = await verifyAccountOwnership(uid, accountId, options);
      if (!ownership.allowed) {
        res.status(ownership.status).json({
          success: false,
          error: ownership.error,
          errorCode: ownership.errorCode
        });
        return;
      }

      const diagnostics = await mt5Connector.getDiagnostics(accountId, uid, options);
      res.json({ success: true, diagnostics });
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        error: err?.message || 'Failed to retrieve diagnostics',
        errorCode: 'MT5_PROVIDER_UNAVAILABLE'
      });
    }
  });

  // 10. Broker Capabilities Lookup
  router.get('/brokers/capabilities/:brokerId', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const { brokerId } = req.params;
      const capabilities = await metaApiAccountProvisioningProvider.getBrokerCapabilities(brokerId);
      res.json({
        success: true,
        capabilities
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to fetch broker capabilities'
      });
    }
  });

  // 11. Create Real MT5 Demo Account
  router.post('/accounts/create-demo', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({
          success: false,
          status: 'FAILED',
          error: 'Unauthorized: Valid Firebase session required.',
          errorCode: 'MT5_AUTH_FAILED'
        });
        return;
      }

      const input: MT5CreateDemoInput = req.body;
      if (!input.brokerId) {
        res.status(400).json({
          success: false,
          status: 'FAILED',
          error: 'Broker ID is required for demo account creation.',
          errorCode: 'MT5_SERVER_INVALID'
        });
        return;
      }

      const result = await metaApiAccountProvisioningProvider.createDemoAccount(input, uid);

      const httpStatus = result.status === 'READY' ? 200 :
                         result.status === 'NEEDS_VERIFICATION' ? 200 :
                         result.status === 'UNSUPPORTED' ? 400 :
                         result.errorCode === 'MT5_CONNECTOR_NOT_CONFIGURED' ? 503 : 400;

      res.status(httpStatus).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        status: 'FAILED',
        error: err?.message || 'Account creation failed.',
        errorCode: 'MT5_CREATION_FAILED'
      });
    }
  });

  // 12. Create Real MT5 Live Account (or return KYC portal guidance)
  router.post('/accounts/create-live', async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({
          success: false,
          status: 'FAILED',
          error: 'Unauthorized: Valid Firebase session required.',
          errorCode: 'MT5_AUTH_FAILED'
        });
        return;
      }

      const input: MT5CreateLiveInput = req.body;
      const result = await metaApiAccountProvisioningProvider.createLiveAccount(input, uid);
      res.status(400).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        status: 'FAILED',
        error: err?.message || 'Live account creation request failed.',
        errorCode: 'MT5_CREATION_FAILED'
      });
    }
  });

  return router;
}
