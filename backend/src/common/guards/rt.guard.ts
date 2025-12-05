import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class rtGuard extends AuthGuard('jwt-refresh') { }