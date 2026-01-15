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
    type: 'file' | 'dir';
}

class GitHubImageLister {
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
     * 格式化檔案大小
     */
    private formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 列出目錄內容
     */
    async listImages(dirPath: string = ''): Promise<void> {
        try {
            // 確保路徑不以 / 開頭
            const cleanPath = dirPath.startsWith('/') ? dirPath.slice(1) : dirPath;

            console.log(`正在查詢目錄: ${cleanPath || '(root)'}...`);

            const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${cleanPath}?ref=${this.branch}`;

            const response = await axios.get<GitHubFileResponse[] | GitHubFileResponse>(url, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            const data = response.data;

            if (!Array.isArray(data)) {
                // 如果是單一檔案
                console.log('\n這是一個檔案:');
                console.log(`名稱: ${data.name}`);
                console.log(`大小: ${this.formatSize(data.size)}`);
                console.log(`URL: ${data.download_url}`);
                return;
            }

            // 過濾並顯示
            const files = data.filter(item => item.type === 'file');
            const dirs = data.filter(item => item.type === 'dir');

            console.log(`\n找到 ${files.length} 個檔案, ${dirs.length} 個資料夾:\n`);

            if (dirs.length > 0) {
                console.log('📁 資料夾:');
                dirs.forEach(dir => {
                    console.log(`  - ${dir.name}/`);
                });
                console.log('');
            }

            if (files.length > 0) {
                console.log('📄 檔案:');
                files.forEach(file => {
                    console.log(`  - ${file.name} (${this.formatSize(file.size)})`);
                    console.log(`    ${file.download_url}`);
                });
            }

            if (files.length === 0 && dirs.length === 0) {
                console.log('(空目錄)');
            }

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    console.error(`❌ 找不到路徑: ${dirPath}`);
                } else {
                    console.error('❌ API 錯誤:', error.response?.data?.message || error.message);
                }
            } else {
                console.error('❌ 錯誤:', error.message);
            }
            process.exit(1);
        }
    }
}

// CLI 執行
async function main() {
    const args = process.argv.slice(2);
    const targetPath = args[0] || ''; // 預設為根目錄

    try {
        const lister = new GitHubImageLister();
        await lister.listImages(targetPath);
    } catch (error: any) {
        console.error('錯誤:', error.message);
        process.exit(1);
    }
}

// 如果直接執行此檔案
if (require.main === module) {
    main();
}

export { GitHubImageLister };
