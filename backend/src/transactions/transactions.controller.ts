import { Body, Controller, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}
  @Post('mint')
  async mint(@Body() body: { amount: number; walletAddress: string }) {
    return await this.transactionService.mint(body.amount, body.walletAddress);
  }

  @Post('create-wallet')
  async createNewWallet() {
    return await this.transactionService.createNewWallet();
  }

  @Post('collect-usdc')
  async collectUSDC(@Body() body: { from: string; to: string}) {
    return await this.transactionService.collect(body.from, body.to);
  }

  @Post('burn-usdc')
  async burnUSDC(@Body() body: { amount: number }) {
    return await this.transactionService.burn(body.amount);
  }
}
