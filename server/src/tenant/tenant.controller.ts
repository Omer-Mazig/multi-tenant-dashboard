import {
  Controller,
  Get,
  Req,
  Res,
  Logger,
  UnauthorizedException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import 'express-session';
import { TenantService } from './tenant.service';
import { TenantSessionGuard } from './tenant-session.guard';
import { AuthService } from '../auth/auth.service';

@Controller('tenant')
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly authService: AuthService,
  ) {}

  @Get('verify-token/:token')
  verifyToken(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      this.logger.debug(
        `Verifying one-time token: ${token.substring(0, 10)}...`,
      );

      // Verify the token
      const result = this.authService.verifyTenantToken(token, req);

      if (!result.success) {
        throw new UnauthorizedException(
          result.message || 'Invalid or expired token',
        );
      }

      // Extract tenant ID from the request
      const tenantId = req.hostname.split('.')[0];
      this.logger.debug(`Token verified successfully for tenant: ${tenantId}`);

      // Determine if this is an API request or a browser request
      const isApiRequest =
        req.xhr || req.headers.accept?.includes('application/json');

      if (isApiRequest) {
        // API request - return JSON response
        return res.status(200).json({
          success: true,
          message: 'Token verified successfully',
          tenantId,
        });
      } else {
        // Force the session to save before redirecting
        if (req.session) {
          req.session.save((err: Error | null) => {
            if (err) {
              this.logger.error(
                `Error saving session before redirect: ${err.message}`,
              );
            }
            // Browser request - redirect to tenant frontend
            this.logger.debug(`Redirecting to tenant frontend`);
            return res.redirect(302, `http://${tenantId}.lvh.me:5173/`);
          });
        } else {
          // Browser request - redirect to tenant frontend
          this.logger.debug(`Redirecting to tenant frontend (no session)`);
          return res.redirect(302, `http://${tenantId}.lvh.me:5173/`);
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Token verification failed: ${errorMessage}`);

      // Return appropriate error response based on request type
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ success: false, message: errorMessage });
      } else {
        return res.status(401).send('Authentication failed');
      }
    }
  }

  @UseGuards(TenantSessionGuard)
  @Get('dashboard')
  dashboard(@Req() req: Request, @Res() res: Response) {
    if (!req.session.user) {
      return res.status(401).send('Not logged in');
    }

    res.send(`Welcome to ${req.hostname}, user: ${req.session.user.id}`);
  }

  @UseGuards(TenantSessionGuard)
  @Get('ping')
  ping(@Req() req: Request, @Res() res: Response) {
    // The guard already updates the lastAccess timestamp
    res.status(200).send({
      success: true,
      message: 'Session refreshed',
      timestamp: Date.now(),
    });
  }
}
