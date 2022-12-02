export default interface VerifyUserResponse {
  success: boolean;
  calldata?: string;
  network?: string;
  contractAddress?: string;
  errMsg?: string;
}