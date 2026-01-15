import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface GitHubFileResponse {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
}

class GitHubImageDeleter {
    private owner: string;
    private repo: string;
    private token: string;
    private branch: string;
    private apiUrl: string;

    constructor() {
        this.owner = process.env.GITHUB_OWNER || '';
        this.repo = process.env.GITHUB_REPO || '';
        this.token = process.env.GITHUB_TOKEN || '';
        this.branch = process.env.GITHUB_BRANCH || 'main';
        this.apiUrl = 'https://api.github.com';

        this.validateConfig();
    }

    private validateConfig(): void {
        if (!this.owner || !this.repo || !this.token) {
            throw new Error('請設定環境變數: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN');
        }
    }

    /**
     * 從 URL 或路徑解析出 repo 內的路徑
     * 支援:
     * 1. 完整 URL: https://raw.githubusercontent.com/owner/repo/main/path/to/file.png
     * 2. 完整 URL (CDN): https://cdn.jsdelivr.net/gh/owner/repo@main/path/to/file.png
     * 3. 相對路徑: path/to/file.png
     */
    private parsePath(input: string): string {
        // 移除 URL 前綴
        let cleanPath = input;

        if (input.startsWith('http')) {
            // 嘗試解析 raw.githubusercontent.com
            const rawPattern = new RegExp(`raw\\.githubusercontent\\.com/${this.owner}/${this.repo}/${this.branch}/(.+)`);
            const rawMatch = input.match(rawPattern);
            if (rawMatch) return rawMatch[1];

            // 嘗試解析 cdn.jsdelivr.net
            // https://cdn.jsdelivr.net/gh/user/repo@version/file
            const cdnPattern = new RegExp(`cdn\\.jsdelivr\\.net/gh/${this.owner}/${this.repo}(?:@${this.branch})?/(.+)`);
            const cdnMatch = input.match(cdnPattern);
            if (cdnMatch) return cdnMatch[1];

            // 如果是其他 URL，嘗試直接提取路徑部分（假設使用者給的是正確的結構）
            // 這裡比較難通用，建議使用者給相對路徑或標準 raw URL
            // 簡單處理：如果包含 repo 名稱，取其後的部分
            const repoIndex = input.indexOf(this.repo);
            if (repoIndex !== -1) {
                // 這是一個很粗略的猜測
                const afterRepo = input.substring(repoIndex + this.repo.length);
                // 移除可能的 /blob/main/ 或 /raw/main/ 或 /main/
                const branchIndex = afterRepo.indexOf(this.branch);
                if (branchIndex !== -1) {
                    return afterRepo.substring(branchIndex + this.branch.length + 1);
                }
            }
        }

        return cleanPath;
    }

    /**
     * 取得檔案 SHA (刪除檔案需要)
     */
    private async getFileSha(filePath: string): Promise<string> {
        try {
            const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${this.branch}`;
            const response = await axios.get<GitHubFileResponse>(url, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            return response.data.sha;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new Error(`找不到檔案: ${filePath}`);
            }
            throw error;
        }
    }

    /**
     * 刪除圖片
     */
    async deleteImage(inputPath: string): Promise<void> {
        try {
            const filePath = this.parsePath(inputPath);
            console.log(`正在處理: ${inputPath}`);
            console.log(`解析路徑: ${filePath}`);

            // 1. 取得檔案 SHA
            const sha = await this.getFileSha(filePath);
            console.log(`取得 SHA: ${sha}`);

            // 2. 呼叫 GitHub API 刪除檔案
            const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}`;

            await axios.delete(
                url,
                {
                    headers: {
                        Authorization: `token ${this.token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/vnd.github.v3+json',
                    },
                    data: {
                        message: `Delete image: ${path.basename(filePath)}`,
                        sha: sha,
                        branch: this.branch,
                    }
                }
            );

            console.log('✅ 刪除成功!');
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('❌ 刪除失敗:', error.response?.data?.message || error.message);
                // throw new Error(`GitHub API 錯誤: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
            } else {
                console.error('❌ 錯誤:', error.message);
                // throw error;
            }
        }
    }

    /**
     * 批次刪除
     */
    async deleteImages(inputs: string[]): Promise<void> {
        for (const input of inputs) {
            await this.deleteImage(input);
            console.log('---');
        }
    }
}

// CLI 執行
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('使用方式:');
        console.log('  npm run delete <path-or-url> [path-or-url-2] ...');
        console.log('');
        console.log('範例:');
        console.log('  npm run delete image/blog/test.png');
        console.log('  npm run delete https://raw.githubusercontent.com/user/repo/main/image/blog/test.png');
        process.exit(1);
    }

    try {
        const deleter = new GitHubImageDeleter();
        await deleter.deleteImages(args);
    } catch (error: any) {
        console.error('錯誤:', error.message);
        process.exit(1);
    }
}

// 如果直接執行此檔案
if (require.main === module) {
    main();
}

export { GitHubImageDeleter };
