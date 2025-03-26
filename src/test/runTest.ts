import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
    const startTime = Date.now();
    console.log(`测试开始时间: ${new Date(startTime).toISOString()}`);
    
    try {
        // 包含测试的文件夹
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // 测试文件路径
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // 下载 VS Code，解压并运行集成测试
        // 设置测试超时为10分钟
        await runTests({ 
            extensionDevelopmentPath, 
            extensionTestsPath,
            launchArgs: [
                '--disable-extensions',
                `--timeout`, '600000'
            ]
        });
        
        const endTime = Date.now();
        console.log(`测试结束时间: ${new Date(endTime).toISOString()}`);
        console.log(`测试总耗时: ${(endTime - startTime) / 1000} 秒`);
    } catch (err) {
        const endTime = Date.now();
        console.error('测试失败:', err);
        console.log(`测试失败时间: ${new Date(endTime).toISOString()}`);
        console.log(`测试总耗时: ${(endTime - startTime) / 1000} 秒`);
        process.exit(1);
    }
}

main(); 