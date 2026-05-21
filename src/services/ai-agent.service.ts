import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import i18n from '@/i18n';
import { useSettingsStore } from '@/stores/settings.store';
import { useWalletStore } from '@/stores/wallet.store';
import { useContactStore } from '@/stores/contact.store';
import {
  sendNativeToken, sendERC20Token, getFullBalance, resolveChainKey,
  getTransactionHistory, estimateGasFee, getTransactionReceipt, getTokenAllowances,
} from './rpc.service';
import { unlockWallet } from './wallet.service';
import type { PendingAction } from '@/types/chat';

function t(key: string): string {
  return i18n.t(key);
}

function getAIClient() {
  const { openaiApiKey, aiBaseUrl, aiModel } = useSettingsStore.getState();
  if (!openaiApiKey) throw new Error(t('chat.noApiKey'));

  const client = createOpenAI({ apiKey: openaiApiKey, baseURL: aiBaseUrl || undefined });
  return { client, model: aiModel || 'gpt-4o-mini' };
}

export async function* streamChat(userMessage: string) {
  const walletStore = useWalletStore.getState();
  const contactStore = useContactStore.getState();
  const settingsStore = useSettingsStore.getState();
  const { client, model } = getAIClient();
  const networkMode = settingsStore.networkMode;

  const selectedWallet = walletStore.wallets.find(w => w.id === walletStore.selectedWalletId);
  const walletAddress = selectedWallet?.addresses[0]?.address ?? t('wallet.noWallet');
  const walletName = selectedWallet?.name ?? '';

  const contacts = contactStore.contacts.map(c => `- ${c.name}: ${c.address}`).join('\n');

  const modeLabel = networkMode === 'testnet' ? t('sidebar.testnetMode') : t('sidebar.testnet');
  const noContactsLabel = t('contacts.noContacts');

  const systemPrompt = `你是一个 AI 钱包助手。你可以帮助用户进行以下操作：
1. 转账（发送代币到指定地址）
2. 保存联系人
3. 查询余额（原生代币 + ERC-20 代币）
4. 查询交易记录（近期交易历史）
5. 估算 Gas 费用（转账前预估手续费）
6. 查询交易状态（通过 tx hash 查看确认数）
7. 检查代币授权额度（安全检测哪些合约可以动用你的代币）

当前状态：
- 网络模式：${modeLabel}
- 已选钱包：${walletName ? `${walletName} (${walletAddress})` : t('wallet.noWallet')}
- 联系人列表：
${contacts || `（${noContactsLabel}）`}

重要规则：
- send_transfer 工具调用后，会弹出确认对话框让用户输入密码。你只需要告知用户查看弹窗即可，绝对不要再次调用 send_transfer。
- 当用户回复"确认"、"好的"、"可以"等同意类话语时，不要再次调用 send_transfer。系统会自动弹出确认框。
- 只有用户明确表达新的转账意图时才调用 send_transfer。
- 如果用户说"帮我转账"但没有指定完整信息，请询问缺失的信息（地址、金额、代币、网络）
- 金额单位使用用户友好的格式（如 "100 USDT"）
- 如果用户提到了联系人名字，在联系人列表中查找对应地址
- 查询交易记录和 Gas 估算时，自动使用当前选中的网络`;

  const result = streamText({
    model: client(model),
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    tools: {
      send_transfer: tool({
        description: '发起代币转账请求。调用后必须立即停止，引导用户在确认弹窗中输入密码。禁止重复调用此工具。',
        parameters: z.object({
          to: z.string().describe('收款地址'),
          amount: z.string().describe('转账金额'),
          token: z.string().optional().describe('代币符号 (BNB, ETH, USDT, USDC 等)'),
          network: z.string().optional().describe('网络名称 (BSC, Ethereum, Polygon)'),
        }),
        execute: async ({ to, amount, token, network }) => {
          return `${t('transfer.pending')}：
- ${t('transfer.recipient')}: ${to}
- ${t('transfer.amount')}: ${amount} ${token || 'BNB'}
- ${t('transfer.network')}: ${network || 'BSC'}

${t('transfer.enterPassword')}`;
        },
      }),
      save_contact: tool({
        description: '保存地址为联系人',
        parameters: z.object({
          address: z.string().describe('钱包地址'),
          name: z.string().describe('联系人名称'),
        }),
        execute: async ({ address, name }) => {
          await contactStore.addContact(name, address);
          return JSON.stringify({ status: 'saved', name, address });
        },
      }),
      get_balance: tool({
        description: '查询钱包余额',
        parameters: z.object({
          token: z.string().optional().describe('代币符号，不填则查询原生代币'),
          network: z.string().optional().describe('网络名称'),
        }),
        execute: async ({ network }) => {
          if (!selectedWallet) return t('wallet.noWallet');
          const chainKey = resolveChainKey(network || 'BSC', networkMode);
          try {
            const balance = await getFullBalance(walletAddress, chainKey);
            return JSON.stringify(balance);
          } catch (e: any) {
            return `查询余额失败: ${e.message}`;
          }
        },
      }),
      get_transaction_history: tool({
        description: '查询钱包交易记录。自动获取近期转入转出记录。',
        parameters: z.object({
          network: z.string().optional().describe('网络名称，默认 BSC'),
          limit: z.number().optional().describe('返回记录数，默认 10，最大 20'),
        }),
        execute: async ({ network, limit }) => {
          if (!selectedWallet) return t('wallet.noWallet');
          const chainKey = resolveChainKey(network || 'BSC', networkMode);
          try {
            const txs = await getTransactionHistory(walletAddress, chainKey, Math.min(limit || 10, 20));
            if (txs.length === 0) return '未找到近期交易记录';
            const chain = { bsc_mainnet: 'BSC', bsc_testnet: 'BSC', ethereum_mainnet: 'Ethereum', ethereum_sepolia: 'Ethereum', polygon_mainnet: 'Polygon', polygon_amoy: 'Polygon' }[chainKey] || chainKey;
            return JSON.stringify(txs.map(tx => ({
              哈希: tx.hash.slice(0, 10) + '...',
              从: tx.from,
              到: tx.to,
              金额: tx.value,
              时间: new Date(tx.timestamp * 1000).toLocaleString('zh-CN'),
              状态: tx.status === 'success' ? '成功' : '失败',
              网络: chain,
            })));
          } catch (e: any) {
            return `查询交易记录失败: ${e.message}`;
          }
        },
      }),
      estimate_gas: tool({
        description: '估算转账 Gas 费用。在用户转账前预估需要的手续费。',
        parameters: z.object({
          to: z.string().optional().describe('收款地址，不填则使用最近转账地址'),
          amount: z.string().describe('转账金额（原生代币）'),
          network: z.string().optional().describe('网络名称，默认 BSC'),
        }),
        execute: async ({ to, amount, network }) => {
          if (!selectedWallet) return t('wallet.noWallet');
          const chainKey = resolveChainKey(network || 'BSC', networkMode);
          try {
            const estimate = await estimateGasFee(walletAddress, to || walletAddress, amount, chainKey);
            return JSON.stringify({
              预估GasLimit: estimate.gasLimit,
              当前GasPrice: estimate.gasPrice,
              预估总手续费: `${estimate.estimatedCostFormatted} ${estimate.symbol}`,
              网络: chainKey,
            });
          } catch (e: any) {
            return `估算 Gas 失败: ${e.message}`;
          }
        },
      }),
      check_transaction: tool({
        description: '查询交易状态。通过交易哈希（tx hash）查看确认数和成功/失败状态。',
        parameters: z.object({
          txHash: z.string().describe('交易哈希 (0x...)'),
          network: z.string().optional().describe('网络名称，默认 BSC'),
        }),
        execute: async ({ txHash, network }) => {
          const chainKey = resolveChainKey(network || 'BSC', networkMode);
          try {
            const status = await getTransactionReceipt(txHash, chainKey);
            const statusLabel = status.status === 'success' ? '成功' : status.status === 'failed' ? '失败' : status.status === 'pending' ? '确认中' : '未找到';
            return JSON.stringify({
              哈希: txHash,
              状态: statusLabel,
              确认数: status.confirmations,
              区块号: status.blockNumber,
              发送方: status.from,
              接收方: status.to,
              网络: chainKey,
            });
          } catch (e: any) {
            return `查询交易状态失败: ${e.message}`;
          }
        },
      }),
      check_approvals: tool({
        description: '检查代币授权额度。查看哪些合约有权动用你的 ERC-20 代币，以及风险等级。',
        parameters: z.object({
          network: z.string().optional().describe('网络名称，默认 BSC'),
        }),
        execute: async ({ network }) => {
          if (!selectedWallet) return t('wallet.noWallet');
          const chainKey = resolveChainKey(network || 'BSC', networkMode);
          try {
            const approvals = await getTokenAllowances(walletAddress, chainKey);
            if (approvals.length === 0) return '当前钱包没有活跃的代币授权，很安全！';
            return JSON.stringify(approvals.map(a => ({
              代币: a.symbol,
              授权给: a.spender,
              授权额度: a.allowanceFormatted,
              风险等级: a.risk === 'high' ? '高风险' : '低风险',
              建议: a.risk === 'high' ? '建议撤销不必要的授权' : '正常',
            })));
          } catch (e: any) {
            return `检查授权失败: ${e.message}`;
          }
        },
      }),
    },
    maxSteps: 2,
  });

  let fullText = '';
  let pendingTransfer: { to: string; amount: string; token?: string; network?: string } | null = null;

  for await (const part of result.fullStream) {
    if (part.type === 'text-delta') {
      fullText += part.textDelta;
      yield { text: fullText };
    } else if (part.type === 'tool-call') {
      const tc = part as { toolName: string; args: unknown };
      if (tc.toolName === 'send_transfer') {
        pendingTransfer = tc.args as typeof pendingTransfer;
      }
    }
  }

  yield { text: fullText, pendingTransfer: pendingTransfer ?? undefined };
}

export async function executeTransfer(pending: PendingAction, password: string): Promise<string> {
  const walletStore = useWalletStore.getState();
  const settingsStore = useSettingsStore.getState();
  const wallet = walletStore.wallets.find(w => w.id === walletStore.selectedWalletId);
  if (!wallet) throw new Error('未选择钱包');

  const unlocked = await unlockWallet(wallet.id, password);

  const { to, amount, token = 'BNB', network = 'BSC' } = pending.params;
  const chainKey = resolveChainKey(network, settingsStore.networkMode);

  if (!token || token.toUpperCase() === 'BNB' || token.toUpperCase() === 'ETH' || token.toUpperCase() === 'POL') {
    return sendNativeToken(unlocked.privateKey, to, amount, chainKey);
  } else {
    return sendERC20Token(unlocked.privateKey, to, amount, token, chainKey);
  }
}
