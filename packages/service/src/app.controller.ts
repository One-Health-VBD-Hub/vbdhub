import { Controller, Get, Head } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiOperation({
    summary: 'Check if app service is running',
    description:
      'This endpoint is used to check if the application service is running and reachable. It does not return any content, but a successful response indicates that the service is operational.\n' +
      'This service sometimes scales down when there is no usage, which may make it temporarily unavailable. Calling this endpoint (or any other) wakes it up.'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is running and reachable'
  })
  @ApiResponse({
    status: 503,
    description:
      'Service unavailable - server is not reachable or temporarily scaled down'
  })
  @Head()
  ping(): void {
    // No need to return a body, this is just to confirm availability
  }

  // Simple health check endpoint for monitoring purposes (e.g. AWS)
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
