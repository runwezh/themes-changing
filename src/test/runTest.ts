import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
    try {
        // 包含测试的文件夹
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // 测试文件路径
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // 下载 VS Code，解压并运行集成测试
        await runTests({ 
            extensionDevelopmentPath, 
            extensionTestsPath,
            launchArgs: [
                '--disable-extensions',
                `--timeout`, '600000'
            ]
        });
    } catch (err) {
        process.exit(1);
    }
}

main(); 