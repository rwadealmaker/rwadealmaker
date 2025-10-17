require('dotenv').config()
const { Web3 } = require('web3');
// 指向真实的以太坊节点 RPC（本地 Ganache 通常 7545；或填你的远端 RPC）
const web3 = new Web3('http://localhost:7545');

// 数据库连接池（按你的路径）
const dbConfig = require('../../database/dbConfig');
const mysql = require('mysql2/promise');
const pool = mysql.createPool(dbConfig.mysql || dbConfig); // 兼容两种导出

// 并发限制
const pLimit = require('p-limit');
const limit = pLimit(5);

async function importBlockTransactions(req, res) {
  try {
    const { blockNumber } = req.body || {};
    if (blockNumber == null) {
      return res.status(400).json({ message: '缺少参数 blockNumber' });
    }

    // true => 带交易列表
    const block = await web3.eth.getBlock(blockNumber, true);
    if (!block) {
      return res.status(404).json({ message: `区块 ${blockNumber} 不存在` });
    }

    const txs = block.transactions || [];
    if (txs.length === 0) {
      return res.status(200).json({ message: `区块 ${blockNumber} 无交易`, count: 0 });
    }

    const ts = new Date(Number(block.timestamp) * 1000);

    const sql = `
      INSERT IGNORE INTO transactions
      (tx_hash, block_number, from_address, to_address, value, gas, gas_price, nonce, input_data, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const jobs = txs.map(tx => limit(async () => {
      try {
        // receipt.status: true=成功, false=失败
        const receipt = await web3.eth.getTransactionReceipt(tx.hash);
        const status = receipt && receipt.status ? 1 : 0;

        const gasPrice =
          (tx.gasPrice ?? tx.maxFeePerGas ?? '0').toString();

        const params = [
          tx.hash,
          block.number,
          tx.from || null,
          tx.to || null,
          (tx.value ?? '0').toString(),
          tx.gas ?? 0,
          gasPrice,
          tx.nonce ?? 0,
          tx.input ?? null,
          status,
          ts,
        ];

        await pool.execute(sql, params);
      } catch (e) {
        console.error(`导入交易 ${tx.hash} 出错:`, e);
      }
    }));

    await Promise.all(jobs);

    console.log("交易导入完成");

    return res.status(200).json({
      message: `区块 ${blockNumber} 交易导入完成`,
      count: txs.length
    });
  } catch (err) {
    console.error('导入交易出错:', err);
    return res.status(500).json({ message: '导入失败', error: String(err) });
  }
}

module.exports = { importBlockTransactions };
