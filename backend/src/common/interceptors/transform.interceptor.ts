import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                let message = 'สำเร็จ';
                let resultData = data;
                let meta;

                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    // Handle pagination
                    if ('data' in data && 'meta' in data) {
                        resultData = data.data;
                        meta = data.meta;
                    }
                    // Handle custom message and data wrapper
                    else if ('message' in data) {
                        message = data.message;
                        if ('data' in data) {
                            resultData = data.data;
                        } else {
                            resultData = {};
                        }
                    }
                }

                return {
                    success: true,
                    message: message,
                    data: resultData,
                    meta: meta,
                };
            }),
        );
    }
}