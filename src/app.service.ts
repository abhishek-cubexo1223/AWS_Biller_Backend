import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! I am Abhishek Yadav and this is my first NestJS application and I am a full stack developer';
  }
}
