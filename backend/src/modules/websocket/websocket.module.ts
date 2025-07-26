import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketGateway as WSGateway } from './websocket.gateway';
import { getAuthConfig } from '../../config/auth.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const authConfig = getAuthConfig(configService);
        return {
          secret: authConfig.jwt.secret,
          signOptions: {
            expiresIn: authConfig.jwt.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [WSGateway],
  exports: [WSGateway],
})
export class WebSocketModule {}