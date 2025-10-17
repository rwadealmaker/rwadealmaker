/**
 * 创建SumSub用户
 * @param {string} businessUserId - 你的业务系统用户唯一标识（如数据库用户ID、手机号）
 * @param {string} userEmail - 用户邮箱（可选，用于SumSub通知）
 * @returns {Promise<string>} SumSub用户ID（后续KYC需用）
 */
async function createSumSubUser(businessUserId, userEmail) {
  try {
    const response = await sumsubClient.createUser({
      externalUserId: businessUserId, // 关联你的业务用户ID（必传）
      email: userEmail,               // 可选，用户邮箱
      phone: '+8613800138000'         // 可选，用户手机号（国际区号格式）
    });
    console.log('SumSub用户创建成功:', response);
    return response.id; // 返回SumSub生成的用户ID
  } catch (error) {
    console.error('创建SumSub用户失败:', error.response?.data || error.message);
    throw new Error('KYC用户初始化失败,请稍后重试');
  }
}