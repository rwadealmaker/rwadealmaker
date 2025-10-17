// 测试API连接的简单脚本
const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 开始测试API连接...');
  
  try {
    // 测试后端服务器是否运行
    console.log('1. 测试后端服务器...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ 后端服务器状态:', healthData);
    
    // 测试项目API
    console.log('2. 测试项目API...');
    const projectResponse = await fetch('http://localhost:3000/api/project');
    const projectData = await projectResponse.json();
    console.log('✅ 项目API响应:', projectData);
    
    // 测试特定项目
    console.log('3. 测试特定项目API...');
    const specificProjectResponse = await fetch('http://localhost:3000/project/select/RWA001');
    const specificProjectData = await specificProjectResponse.json();
    console.log('✅ 特定项目API响应:', specificProjectData);
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    console.log('请确保后端服务器正在运行: npm run dev (在Mysql目录下)');
  }
}

testAPI();
