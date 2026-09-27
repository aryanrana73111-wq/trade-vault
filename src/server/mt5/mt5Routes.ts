import express, { Request, Response } from 'express';
import { mt5Connector } from './mt5Connector';
import { searchMT5Brokers } from '../../lib/mt5BrokerDirectory';
import { MT5AccountCredentials } from '../../types/mt5';

export function createMT5Router(): express.Router {
  const router = express.Router();

  // 1. Broker & Server Directory Search
  router.get('/brokers', (req: Request, res: Response) => {
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

  // 2. Verify Broker Server Connectivity
  router.post('/verify-server', async (req: Request, res: Response) => {
    try {
      const { server } = req.body;
      if (!server) {
        res.status(400).json({ success: false, error: 'Server name is required' });
        return;
      }
      const result = await mt5Connector.verifyServer(server);
      res.json({
        success: result.reachable,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server check failed' });
    }
  });

  // 3. Connect MT5 Account (Strictly Read-Only with Investor Password)
  router.post('/connect', async (req: Request, res: Response) => {
    try {
      const credentials: MT5AccountCredentials = req.body;

      if (!credentials.server || !credentials.accountNumber) {
        res.status(400).json({ 
          success: false, 
          error: 'MT5 connection failed: Server and Login ID are required.' 
        });
        return;
      }

      const result = await mt5Connector.connect(credentials);
      res.json({
        success: true,
        message: result.message,
        account: result.accountInfo
      });
    } catch (err: any) {
      const msg = err?.message || 'MT5 connection failed';
      // Format response as "MT5 connection failed: [reason]" as specified by requirements
      const formattedError = msg.startsWith('MT5 connection failed') ? msg : `MT5 connection failed: ${msg}`;
      res.status(400).json({ 
        success: false, 
        error: formattedError
      });
    }
  });

  // 4. Create New Demo MT5 Account
  router.post('/create-account', async (req: Request, res: Response) => {
    try {
      const { brokerId, balance, leverage, currency } = req.body;
      const accountData = await mt5Connector.createDemoAccount({
        brokerId: brokerId || 'sharkfunded',
        balance: Number(balance) || 10000,
        leverage: Number(leverage) || 100,
        currency: currency || 'USD'
      });

      res.json({
        success: true,
        message: `New MT5 Demo account ${accountData.loginId} successfully provisioned on ${accountData.server}.`,
        account: accountData
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to provision MT5 demo account.'
      });
    }
  });

  // 5. Live Connection Status
  router.get('/status/:accountId', async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const status = await mt5Connector.getConnectionStatus(accountId);
      res.json({ success: true, ...status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 6. Account Details
  router.get('/account/:accountId', async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const accountInfo = await mt5Connector.getAccountInfo(accountId);
      res.json({ success: true, account: accountInfo });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err?.message || 'Account not found' });
    }
  });

  // 7. Live Open Positions (Unrealized)
  router.get('/positions/:accountId', async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const positions = await mt5Connector.getOpenPositions(accountId);
      res.json({
        success: true,
        count: positions.length,
        positions
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 8. Synchronize Historical Trades
  router.post('/sync/:accountId', async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const periodDays = req.body?.periodDays ? parseInt(req.body.periodDays, 10) : 30;
      const result = await mt5Connector.syncTrades(accountId, periodDays);
      res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Trade sync failed' });
    }
  });

  // 9. Disconnect Account
  router.post('/disconnect/:accountId', async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const result = await mt5Connector.disconnect(accountId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  return router;
}
