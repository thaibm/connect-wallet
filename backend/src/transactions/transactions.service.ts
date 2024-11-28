import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, ethers, parseUnits, Wallet } from 'ethers';
import { USDC_ABI } from 'src/abi/abi';
import { MaxUint256 } from 'ethers';
import { PermitParams } from 'src/types';

const TOKEN_NAME = 'USDC';
const TOKEN_VERSION = '2';
const CHAIN_ID = '11155111';
@Injectable()
export class TransactionsService {
  private wallet: ethers.Wallet;
  private readonly usdcContract: Contract;
  private readonly provider: ethers.JsonRpcProvider;
  private readonly tokenDecimals: number = 6;
  private readonly USDC_ADDRESS: string;

  constructor(private configService: ConfigService) {
    try {
      const WALLET_PRIVATE_KEY =
        this.configService.get<string>('WALLET_PRIVATE_KEY');

      const RPC_PROVIDER = this.configService.get<string>('RPC_PROVIDER');

      this.USDC_ADDRESS = this.configService.get<string>('USDC_ADDRESS');

      if (!WALLET_PRIVATE_KEY) {
        throw new Error('Private key is missing. Please check your .env file.');
      }

      this.provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
      this.wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, this.provider);

      this.usdcContract = new ethers.Contract(
        this.USDC_ADDRESS,
        USDC_ABI,
        this.wallet,
      );
    } catch (error) {
      console.log('Failed to initialize', error);
    }
  }

  async mint(
    amount: number,
    walletAddress: string,
  ): Promise<{ transactionHash: string }> {
    try {
      const value = parseUnits(amount.toString(), this.tokenDecimals);
      const tx = await this.usdcContract.mint(walletAddress, value);
      await tx.wait();
      return { transactionHash: tx.hash };
    } catch (error) {
      throw new HttpException(
        `Minting failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createNewWallet(): Promise<{ address: string }> {
    try {
      const newWallet = Wallet.createRandom(this.provider);
      const spender = this.wallet.address;
      const value = MaxUint256;
      const nonce = 0;
      const expiredTime = 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + expiredTime;
      this.permit({
        ownerWallet: newWallet,
        ownerAddress: newWallet.address,
        spender,
        value,
        nonce,
        deadline,
      });

      return { address: newWallet.address };
    } catch (error) {
      throw new HttpException(
        `Failed to create a new wallet: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async permit(params: PermitParams) {
    const { ownerWallet, ownerAddress, spender, value, nonce, deadline } =
      params;
    const signature = await this.generatePermitSignature({
      ownerAddress,
      ownerWallet,
      spender,
      value,
      nonce,
      deadline,
    });

    const tx = await this.usdcContract.permit(
      ownerAddress,
      spender,
      value,
      deadline,
      signature,
    );
    await tx.wait();
  }

  private getDomain() {
    return {
      name: TOKEN_NAME,
      version: TOKEN_VERSION,
      chainId: CHAIN_ID,
      verifyingContract: this.USDC_ADDRESS,
    };
  }

  private getTypes() {
    return {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };
  }

  async generatePermitSignature({
    ownerWallet,
    ownerAddress,
    spender,
    value,
    nonce,
    deadline,
  }: PermitParams) {
    const message = {
      owner: ownerAddress,
      spender,
      value,
      nonce,
      deadline,
    };
    // Generate EIP-712 typed data signature
    try {
      const signature = await ownerWallet.signTypedData(
        this.getDomain(),
        this.getTypes(),
        message,
      );

      return signature;
    } catch (error) {
      console.error(error);
    }
  }

  async collect(
    from: string,
    to: string,
  ): Promise<{ transactionHash: string }> {
    try {
      const balance = await this.usdcContract.balanceOf(from);

      if (BigInt(balance?.toString()) === 0n) {
        throw new HttpException(
          'Insufficient balance to collect',
          HttpStatus.BAD_REQUEST,
        );
      }
      const tx = await this.usdcContract.transferFrom(from, to, balance);
      await tx.wait();
      return { transactionHash: tx.hash };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async burn(amount: number): Promise<{ transactionHash: string }> {
    try {
      const value = parseUnits(amount?.toString(), this.tokenDecimals);
      const balance = await this.usdcContract.balanceOf(this.wallet.address);
      if (balance < value) {
        throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      const tx = await this.usdcContract.burn(value);
      await tx.wait();
      return { transactionHash: tx.hash };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
