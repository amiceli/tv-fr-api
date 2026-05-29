import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Observable, of } from 'rxjs'

@Injectable()
export class HeaderInterceptor implements NestInterceptor {
    public constructor(private configService: ConfigService) {}

    private readonly logger = new Logger(HeaderInterceptor.name)

    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest()
        const { headers } = request
        const allowedForward = this.configService.get<string>('ALLOWED_FORWARD')
        const headerValue = headers[`x-internal-cron`]

        this.logger.debug(`action=handle_request, header=${headerValue}`)

        if (headerValue === allowedForward) {
            this.logger.log(`action=handle_request, status=continue`)

            return next.handle()
        }

        this.logger.warn(`action=handle_request, status=block, reason=invalid x-internal-cron`)

        return of([])
    }
}
