import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { authenticator, totp } from 'otplib';

@Injectable()
export class SecureShieldService {
  constructor(private configService: ConfigService) {}

  private readonly algorithm = 'aes-256-cbc';
  private readonly serviceName = 'ft_transendence';

  generateOtpAuthUrl(email: string, secretKey: string): string {
    return authenticator.keyuri(email, this.serviceName, secretKey);
  }

  generateSecretKey(): string {
    return authenticator.generateSecret();
  }

  generateTotp(secretKey: string): string {
    return totp.generate(secretKey);
  }

  isValidTotp(token: string, secretKey: string): boolean {
    return totp.verify({ token, secret: secretKey });
  }

  encrypt(text: string): string {
    const iv = randomBytes(16); // 초기화 벡터: 같은 데이터를 암호화해도 암호화 결과를 매번 다르게 해준다.
    const cipher = createCipheriv(
      this.algorithm,
      Buffer.from(this.configService.get<string>('ENCRYPT_KEY')),
      iv,
    );
    let encrypted = cipher.update(text); // cipher를 가지고 text를 암호화
    // 암호화된 데이터('encrypted')와 마지막 암호화된 데이터조각 'cipher.final()'을 결합하여 암호화된 데이터를 연속된 버퍼로만듦.
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // 바이너리 코드를 16진수로 변환해서 데이터를 쉽게 처리(저장, 전송, 읽기 등)하기 위함
    // 추후에 암호문 해독을 위해서는 iv를 가지고 있어야하기 때문에 암호문과 iv를 같이 반환함.
    return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
  }

  decrypt(text: string) {
    const encryptionRes = JSON.parse(text) as { iv: string; encryptedData: string };
    const iv = Buffer.from(encryptionRes.iv);
    const encrypted = Buffer.from(encryptionRes.encryptedData);
    const decipher = createDecipheriv(
      this.algorithm,
      Buffer.from(this.configService.get<string>('ENCRYPT_KEY')),
      iv,
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
