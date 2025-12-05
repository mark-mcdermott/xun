/**
 * Cloudflare Pages API client for monitoring deployments
 */

import type { CloudflareDeployment, CloudflareDeploymentsResponse } from './types';

export class CloudflareClient {
  private token: string;
  private accountId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(token: string, accountId: string) {
    this.token = token;
    this.accountId = accountId;
  }

  /**
   * Get recent deployments for a Pages project
   */
  async getDeployments(projectName: string, limit = 10): Promise<CloudflareDeployment[]> {
    const url = `${this.baseUrl}/accounts/${this.accountId}/pages/projects/${projectName}/deployments`;

    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get deployments: ${response.status} ${text}`);
    }

    const data: CloudflareDeploymentsResponse = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
    }

    return data.result.slice(0, limit);
  }

  /**
   * Get a specific deployment by ID
   */
  async getDeployment(projectName: string, deploymentId: string): Promise<CloudflareDeployment> {
    const url = `${this.baseUrl}/accounts/${this.accountId}/pages/projects/${projectName}/deployments/${deploymentId}`;

    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get deployment: ${response.status} ${text}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
    }

    return data.result;
  }

  /**
   * Get the latest deployment for a project
   */
  async getLatestDeployment(projectName: string): Promise<CloudflareDeployment | null> {
    const deployments = await this.getDeployments(projectName, 1);
    return deployments.length > 0 ? deployments[0] : null;
  }

  /**
   * Wait for a deployment to complete (with timeout)
   */
  async waitForDeployment(
    projectName: string,
    deploymentId: string,
    options: {
      pollInterval?: number;
      timeout?: number;
      onProgress?: (deployment: CloudflareDeployment) => void;
    } = {}
  ): Promise<CloudflareDeployment> {
    const { pollInterval = 3000, timeout = 600000, onProgress } = options;
    const startTime = Date.now();

    while (true) {
      const deployment = await this.getDeployment(projectName, deploymentId);

      if (onProgress) {
        onProgress(deployment);
      }

      const stage = deployment.latest_stage;

      // Terminal states
      if (stage.name === 'success' || (stage.name === 'deploy' && stage.status === 'success')) {
        return deployment;
      }

      if (stage.status === 'failure' || stage.name === 'failure') {
        throw new Error('Deployment failed');
      }

      if (stage.status === 'canceled' || stage.name === 'canceled') {
        throw new Error('Deployment canceled');
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Deployment timeout exceeded');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Find deployment by commit SHA
   */
  async findDeploymentByCommit(
    projectName: string,
    commitSha: string
  ): Promise<CloudflareDeployment | null> {
    const deployments = await this.getDeployments(projectName, 20);

    console.log('CloudflareClient: Found', deployments.length, 'recent deployments');

    for (const deployment of deployments) {
      const deploymentCommit = deployment.deployment_trigger?.metadata?.commit_hash;
      console.log('  Deployment', deployment.id, 'commit:', deploymentCommit || 'no commit');

      if (deploymentCommit === commitSha) {
        console.log('  Match found!');
        return deployment;
      }
    }

    console.log('  No matching deployment found. Looking for SHA:', commitSha);
    return null;
  }

  /**
   * Get deployment progress as percentage (0-100)
   */
  getDeploymentProgress(deployment: CloudflareDeployment): number {
    const stage = deployment.latest_stage;

    if (stage.status === 'failure' || stage.name === 'failure') {
      return 0;
    }

    switch (stage.name) {
      case 'queued':
        return 10;
      case 'initialize':
        return 20;
      case 'clone_repo':
        return 30;
      case 'build':
        return stage.status === 'active' ? 50 : 60;
      case 'deploy':
        return stage.status === 'active' ? 80 : 90;
      case 'success':
        return 100;
      default:
        return 0;
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
}
