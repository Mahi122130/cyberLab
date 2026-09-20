import { Injectable, NotFoundException } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as http from 'http';
import { DatabaseService } from '../database/database.service';

interface ContainerConfig {
  labId: number;
  dir: string;
  port: number;
  serviceName: string;
}

@Injectable()
export class ContainersService {
  private readonly configs: Map<number, ContainerConfig> = new Map([
    [1, { labId: 1, dir: 'challenges/web/forgotten-admin', port: 8082, serviceName: 'forgotten_admin' }],
    [3, { labId: 3, dir: 'challenges/web/forgotten-admin-easy', port: 8083, serviceName: 'forgotten_admin_easy' }],
    [4, { labId: 4, dir: 'challenges/linux/linux-basics', port: 8084, serviceName: 'linux_basics' }],
    [5, { labId: 5, dir: 'challenges/web/security-basics', port: 8085, serviceName: 'security_basics' }],
    [6, { labId: 6, dir: 'challenges/network/network-recon', port: 8086, serviceName: 'network_recon' }],
    [7, { labId: 7, dir: 'challenges/crypto/crypto-basics', port: 8087, serviceName: 'crypto_basics' }],
    [8, { labId: 8, dir: 'labs/idor-advanced', port: 8080, serviceName: 'idor_advanced' }],
  ]);

  constructor(private readonly database: DatabaseService) {}

  private async pingPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${port}`, { timeout: 1500 }, (res) => {
        resolve(res.statusCode !== undefined);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  private getProjectRoot(): string {
    // Current working directory or 2 levels up from apps/api
    return path.resolve(process.cwd().includes('apps') ? path.join(process.cwd(), '../..') : process.cwd());
  }

  async getTargetStatus(labId: number) {
    const config = this.configs.get(labId);
    if (!config) {
      throw new NotFoundException(`No target container configured for lab ${labId}`);
    }

    const isRunning = await this.pingPort(config.port);
    const targetUrl = `http://localhost:${config.port}`;

    return {
      success: true,
      lab_id: labId,
      running: isRunning,
      target_url: targetUrl,
      port: config.port,
      state: isRunning ? 'running' : 'stopped'
    };
  }

  async startTarget(labId: number) {
    const config = this.configs.get(labId);
    if (!config) {
      throw new NotFoundException(`No target container configured for lab ${labId}`);
    }

    const targetDir = path.resolve(this.getProjectRoot(), config.dir);

    // Run docker compose up -d
    await new Promise<void>((resolve, reject) => {
      exec('docker compose up -d', { cwd: targetDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(`docker compose up error for lab ${labId}:`, stderr || error.message);
          return reject(new Error(`Failed to start container: ${stderr || error.message}`));
        }
        resolve();
      });
    });

    // Wait up to 10s for the container to respond
    let running = false;
    for (let i = 0; i < 20; i++) {
      running = await this.pingPort(config.port);
      if (running) break;
      await new Promise(r => setTimeout(r, 500));
    }

    const targetUrl = `http://localhost:${config.port}`;

    // Update target_url in DB if needed
    await this.database.query('UPDATE labs SET target_url = ? WHERE id = ?', [targetUrl, labId]);

    return {
      success: true,
      lab_id: labId,
      running,
      target_url: targetUrl,
      port: config.port,
      state: running ? 'running' : 'starting',
      message: running ? 'Challenge environment started successfully.' : 'Container starting...'
    };
  }

  async stopTarget(labId: number) {
    const config = this.configs.get(labId);
    if (!config) {
      throw new NotFoundException(`No target container configured for lab ${labId}`);
    }

    const targetDir = path.resolve(this.getProjectRoot(), config.dir);

    await new Promise<void>((resolve, reject) => {
      exec('docker compose stop', { cwd: targetDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(`docker compose stop error for lab ${labId}:`, stderr || error.message);
          return reject(new Error(`Failed to stop container: ${stderr || error.message}`));
        }
        resolve();
      });
    });

    return {
      success: true,
      lab_id: labId,
      running: false,
      port: config.port,
      state: 'stopped',
      message: 'Challenge environment stopped.'
    };
  }
}
