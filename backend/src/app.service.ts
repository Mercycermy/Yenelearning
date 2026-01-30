import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string; status: string } {
    return {
      message: 'Welcome to Yene Teacher API',
      version: '1.0.0',
      status: 'running',
    };
  }
}
