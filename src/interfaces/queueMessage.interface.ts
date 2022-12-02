export default interface QueueMessage {
  callType: string;
  inputData?: string;
  proofData?: string;
  publicData?: string;
  chain?: string;
  contractAddress?: string;
  walletAddress?: string;
  ts: number
};
