const fs = require('fs');
const path = require('path');

// 获取北京时间
function getBeijingTime() {
    const now = new Date();
    const beijingOffset = 8 * 60; // 北京时间 UTC+8
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (beijingOffset * 60000));
}

// 格式化时间
function formatTime(date) {
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 处理统计数据
function processStatsData(data) {
    const now = getBeijingTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 计算统计数据
    const totalViews = data.length;
    const todayViews = data.filter(item => {
        const itemDate = new Date(item.recorded_at);
        const itemBeijingDate = new Date(itemDate.getTime() + (8 * 60 * 60 * 1000));
        return itemBeijingDate >= today;
    }).length;
    
    // 按页面分组统计
    const pageGroups = {};
    data.forEach(item => {
        const key = `${item.url}|${item.title}`;
        if (!pageGroups[key]) {
            pageGroups[key] = {
                url: item.url,
                title: item.title,
                count: 0
            };
        }
        pageGroups[key].count++;
    });
    
    const uniquePages = Object.keys(pageGroups).length;
    
    // 按访问次数排序
    const sortedPages = Object.values(pageGroups).sort((a, b) => b.count - a.count);
    
    return {
        totalViews,
        todayViews,
        uniquePages,
        pages: sortedPages
    };
}

// 生成统计页面
function generateStatsPage() {
    try {
        // 读取访问日志
        const logsPath = path.join(__dirname, '../stats-data/access-logs.json');
        const logsData = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        
        // 处理统计数据
        const stats = processStatsData(logsData);
        
        // 生成HTML页面
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面访问统计</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); text-align: center; transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-number { font-size: 2.5em; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .stat-label { color: #666; font-size: 1.1em; }
        .content { padding: 30px; }
        .section-title { font-size: 1.8em; color: #333; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #667eea; }
        .stats-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
        .stats-table th { background: #667eea; color: white; padding: 15px; text-align: left; font-weight: 500; }
        .stats-table td { padding: 15px; border-bottom: 1px solid #eee; }
        .stats-table tr:hover { background: #f8f9fa; }
        .url-cell { max-width: 300px; word-break: break-all; }
        .title-cell { max-width: 200px; word-break: break-all; }
        .count-cell { text-align: center; font-weight: bold; color: #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-top: 1px solid #eee; }
        .update-info { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 30px; color: #2e7d32; }
        @media (max-width: 768px) { .header h1 { font-size: 2em; } .stats-grid { grid-template-columns: 1fr; padding: 20px; } .content { padding: 20px; } .stats-table { font-size: 14px; } .stats-table th, .stats-table td { padding: 10px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 页面访问统计</h1>
            <p>实时监控页面访问情况，了解用户行为</p>
        </div>
        
        <div class="update-info">
            <strong>🔄 自动更新：</strong>此页面通过GitHub Actions自动生成，每15分钟更新一次。最后更新时间：${formatTime(now)}
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalViews}</div>
                <div class="stat-label">总访问次数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.todayViews}</div>
                <div class="stat-label">今日访问次数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.uniquePages}</div>
                <div class="stat-label">唯一页面</div>
            </div>
        </div>
        
        <div class="content">
            <h2 class="section-title">📈 访问记录详情</h2>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>页面标题</th>
                        <th>页面URL</th>
                        <th>累计访问次数</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.pages.map(page => `
                        <tr>
                            <td class="title-cell">${page.title}</td>
                            <td class="url-cell">${page.url}</td>
                            <td class="count-cell">${page.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>统计时间：${formatTime(now)} | 基于北京时间 (UTC+8) | 通过GitHub Actions自动生成</p>
        </div>
    </div>
</body>
</html>`;
        
        // 写入HTML文件
        const outputPath = path.join(__dirname, '../stats-page.html');
        fs.writeFileSync(outputPath, html, 'utf8');
        
        console.log('✅ 统计页面生成成功');
        console.log(`📊 总访问次数: ${stats.totalViews}`);
        console.log(`📅 今日访问次数: ${stats.todayViews}`);
        console.log(`🌐 唯一页面: ${stats.uniquePages}`);
        
    } catch (error) {
        console.error('❌ 生成统计页面失败:', error);
        process.exit(1);
    }
}

// 执行生成
generateStatsPage();
