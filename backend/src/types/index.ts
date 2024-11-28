import { ethers } from "ethers";

export interface PermitParams {
  ownerWallet: ethers.HDNodeWallet;
  ownerAddress: string;
  spender: string;
  value: ethers.BigNumberish;
  nonce: number;
  deadline: number;
}
